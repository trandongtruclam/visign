import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { lessonAnalytics } from "@/db/schema";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

type LessonMetrics = {
  totalChallenges: number;
  correctFirstTry: number;
  totalRetries: number;
  totalTimeSeconds: number;
  pointsEarned: number;
  challengeDetails: {
    type: string;
    retries: number;
    timeSpent: number;
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, metrics } = (await req.json()) as {
      lessonId: number;
      metrics: LessonMetrics;
    };

    const accuracyRate =
      (metrics.correctFirstTry / metrics.totalChallenges) * 100;
    const avgTimePerChallenge = metrics.totalTimeSeconds / metrics.totalChallenges;
    const retryRate = metrics.totalRetries / metrics.totalChallenges;

    const prompt = `You are an encouraging and insightful language learning coach. Analyze this user's lesson performance and provide personalized, motivating feedback.

Performance Data:
- Total Challenges: ${metrics.totalChallenges}
- First-Try Success: ${metrics.correctFirstTry} (${accuracyRate.toFixed(1)}%)
- Total Retries: ${metrics.totalRetries} (avg ${retryRate.toFixed(1)} per challenge)
- Total Time: ${Math.floor(metrics.totalTimeSeconds / 60)} minutes ${metrics.totalTimeSeconds % 60} seconds
- Average Time per Challenge: ${avgTimePerChallenge.toFixed(0)} seconds
- Points Earned: ${metrics.pointsEarned}

Challenge Breakdown:
${metrics.challengeDetails.map((c, i) => `Challenge ${i + 1} (${c.type}): ${c.retries} retries, ${c.timeSpent}s`).join("\n")}

Provide feedback in 3 sections:
1. Strengths (1-2 sentences highlighting what they did well)
2. Areas for Improvement (1-2 specific, actionable suggestions)
3. Motivation (1 encouraging sentence)

Keep it concise, personal, and motivating. Focus on sign language learning specifically. Do NOT use emojis.`;

    let feedback = "";

    if (OPENAI_API_KEY) {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a supportive sign language learning coach. Never use emojis in your responses.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      feedback = data.choices[0].message.content;
    } else if (ANTHROPIC_API_KEY) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      feedback = data.content[0].text;
    } else {
      feedback = generateRuleBasedFeedback(
        accuracyRate,
        retryRate,
        avgTimePerChallenge
      );
    }

    await db.insert(lessonAnalytics).values({
      userId,
      lessonId,
      completedAt: new Date(),
      totalChallenges: metrics.totalChallenges,
      correctFirstTry: metrics.correctFirstTry,
      totalRetries: metrics.totalRetries,
      totalTimeSeconds: metrics.totalTimeSeconds,
      pointsEarned: metrics.pointsEarned,
      challengeDetails: JSON.stringify(metrics.challengeDetails),
      aiFeedback: feedback,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}

function generateRuleBasedFeedback(
  accuracyRate: number,
  retryRate: number,
  avgTime: number
): string {
  let feedback = "Lesson Summary\n\n";

  feedback += "Strengths\n";
  if (accuracyRate >= 80) {
    feedback +=
      "Excellent accuracy! You're mastering the signs quickly. ";
  } else if (accuracyRate >= 60) {
    feedback += "Good progress! You're getting most signs correct. ";
  } else {
    feedback +=
      "You completed the lesson! Every attempt helps you learn. ";
  }

  if (avgTime < 15) {
    feedback += "Your quick response time shows great confidence.\n\n";
  } else {
    feedback +=
      "Taking time to think through each sign shows careful learning.\n\n";
  }

  feedback += "Areas for Improvement\n";
  if (retryRate > 1.5) {
    feedback +=
      "Try watching the reference videos more carefully before attempting. ";
    feedback += "Practice challenging signs multiple times before moving on.\n\n";
  } else if (avgTime > 30) {
    feedback += "Build confidence by practicing signs daily. ";
    feedback += "Try repeating lessons to improve muscle memory.\n\n";
  } else {
    feedback += "Keep practicing to maintain this great momentum. ";
    feedback += "Challenge yourself with harder lessons.\n\n";
  }

  feedback += "Keep Going\n";
  feedback +=
    "Sign language mastery comes with consistent practice. You're doing great!";

  return feedback;
}

