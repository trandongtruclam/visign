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
  // Enhanced metrics
  typePerformance?: Record<
    string,
    {
      total: number;
      firstTryCorrect: number;
      totalRetries: number;
      totalTime: number;
    }
  >;
  performanceTrend?: "improving" | "declining" | "consistent";
  firstHalfAccuracy?: string;
  secondHalfAccuracy?: string;
  timePattern?: {
    fastCorrect: number;
    slowCorrect: number;
    fastWrong: number;
    slowWrong: number;
  };
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

    // Build enhanced performance insights
    let typePerformanceText = "";
    if (metrics.typePerformance) {
      typePerformanceText = "\n\nPerformance by Challenge Type:\n";
      Object.entries(metrics.typePerformance).forEach(([type, data]) => {
        const accuracy = ((data.firstTryCorrect / data.total) * 100).toFixed(1);
        const avgTime = (data.totalTime / data.total).toFixed(0);
        typePerformanceText += `- ${type}: ${data.firstTryCorrect}/${data.total} first-try (${accuracy}%), avg ${avgTime}s per challenge\n`;
      });
    }

    let progressionText = "";
    if (metrics.performanceTrend && metrics.firstHalfAccuracy && metrics.secondHalfAccuracy) {
      progressionText = `\n\nProgress Pattern: ${metrics.performanceTrend.toUpperCase()}
- First Half Accuracy: ${metrics.firstHalfAccuracy}%
- Second Half Accuracy: ${metrics.secondHalfAccuracy}%`;
    }

    let timePatternText = "";
    if (metrics.timePattern) {
      const { fastCorrect, slowCorrect, fastWrong, slowWrong } = metrics.timePattern;
      timePatternText = `\n\nTime Efficiency:
- Fast & Correct: ${fastCorrect} (confident)
- Slow & Correct: ${slowCorrect} (thoughtful)
- Fast & Wrong: ${fastWrong} (rushing)
- Slow & Wrong: ${slowWrong} (struggling)`;
    }

    const prompt = `You are an encouraging and insightful sign language learning coach. Analyze this user's lesson performance and provide personalized, motivating feedback.

Performance Data:
- Total Challenges: ${metrics.totalChallenges}
- First-Try Success: ${metrics.correctFirstTry} (${accuracyRate.toFixed(1)}%)
- Total Retries: ${metrics.totalRetries} (avg ${retryRate.toFixed(1)} per challenge)
- Total Time: ${Math.floor(metrics.totalTimeSeconds / 60)} minutes ${metrics.totalTimeSeconds % 60} seconds
- Average Time per Challenge: ${avgTimePerChallenge.toFixed(0)} seconds
- Points Earned: ${metrics.pointsEarned}
${typePerformanceText}${progressionText}${timePatternText}

Challenge Breakdown:
${metrics.challengeDetails.map((c, i) => `Challenge ${i + 1} (${c.type}): ${c.retries} retries, ${c.timeSpent}s`).join("\n")}

Provide feedback in 3 sections:
1. Strengths (1-2 sentences highlighting what they did well, be SPECIFIC about challenge types if applicable)
2. Areas for Improvement (1-2 specific, actionable suggestions based on their weak points - mention specific challenge types, rushing vs struggling patterns, or fatigue if detected)
3. Motivation (1 encouraging sentence)

Keep it concise, personal, and motivating. Focus on sign language learning specifically. Do NOT use emojis.`;

    let feedback = "";

    if (OPENAI_API_KEY) {
      try {
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
          const errorData = await response.json().catch(() => null);
          
          // Handle rate limiting gracefully - fall back to rule-based feedback
          if (response.status === 429) {
            console.warn("OpenAI rate limit hit, using rule-based feedback");
            feedback = generateRuleBasedFeedback(
              accuracyRate,
              retryRate,
              avgTimePerChallenge,
              metrics
            );
          } else {
            console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorData);
            // Fall back to rule-based feedback for any API error
            feedback = generateRuleBasedFeedback(
              accuracyRate,
              retryRate,
              avgTimePerChallenge,
              metrics
            );
          }
        } else {
          const data = await response.json();
          feedback = data.choices[0].message.content;
        }
      } catch (openAIError) {
        console.error("Error calling OpenAI API:", openAIError);
        // Fall back to rule-based feedback
        feedback = generateRuleBasedFeedback(
          accuracyRate,
          retryRate,
          avgTimePerChallenge,
          metrics
        );
      }
    } else if (ANTHROPIC_API_KEY) {
      try {
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
          const errorData = await response.json().catch(() => null);
          
          // Handle rate limiting gracefully - fall back to rule-based feedback
          if (response.status === 429) {
            console.warn("Anthropic rate limit hit, using rule-based feedback");
            feedback = generateRuleBasedFeedback(
              accuracyRate,
              retryRate,
              avgTimePerChallenge,
              metrics
            );
          } else {
            console.error(`Anthropic API error: ${response.status} ${response.statusText}`, errorData);
            // Fall back to rule-based feedback for any API error
            feedback = generateRuleBasedFeedback(
              accuracyRate,
              retryRate,
              avgTimePerChallenge,
              metrics
            );
          }
        } else {
          const data = await response.json();
          feedback = data.content[0].text;
        }
      } catch (anthropicError) {
        console.error("Error calling Anthropic API:", anthropicError);
        // Fall back to rule-based feedback
        feedback = generateRuleBasedFeedback(
          accuracyRate,
          retryRate,
          avgTimePerChallenge,
          metrics
        );
      }
    } else {
      feedback = generateRuleBasedFeedback(
        accuracyRate,
        retryRate,
        avgTimePerChallenge,
        metrics
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
      // Enhanced metrics
      typePerformance: metrics.typePerformance
        ? JSON.stringify(metrics.typePerformance)
        : null,
      performanceTrend: metrics.performanceTrend || null,
      firstHalfAccuracy: metrics.firstHalfAccuracy || null,
      secondHalfAccuracy: metrics.secondHalfAccuracy || null,
      timePattern: metrics.timePattern
        ? JSON.stringify(metrics.timePattern)
        : null,
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
  avgTime: number,
  metrics: LessonMetrics
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

  // Add type-specific strengths
  if (metrics.typePerformance) {
    const bestType = Object.entries(metrics.typePerformance)
      .map(([type, data]) => ({
        type,
        accuracy: (data.firstTryCorrect / data.total) * 100,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)[0];

    if (bestType && bestType.accuracy >= 80) {
      feedback += `You excel at ${bestType.type} challenges (${bestType.accuracy.toFixed(0)}% first-try). `;
    }
  }

  if (avgTime < 15) {
    feedback += "Your quick response time shows great confidence.\n\n";
  } else {
    feedback +=
      "Taking time to think through each sign shows careful learning.\n\n";
  }

  feedback += "Areas for Improvement\n";

  // Check for performance trend
  if (
    metrics.performanceTrend === "declining" &&
    metrics.firstHalfAccuracy &&
    metrics.secondHalfAccuracy
  ) {
    feedback += `Your accuracy declined in the second half (${metrics.firstHalfAccuracy}% → ${metrics.secondHalfAccuracy}%). Consider taking breaks during longer lessons. `;
  }

  // Check for weak challenge types
  if (metrics.typePerformance) {
    const weakType = Object.entries(metrics.typePerformance)
      .map(([type, data]) => ({
        type,
        accuracy: (data.firstTryCorrect / data.total) * 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)[0];

    if (weakType && weakType.accuracy < 50) {
      feedback += `Focus more on ${weakType.type} challenges - they need extra practice. `;
    }
  }

  // Check for rushing pattern
  if (metrics.timePattern && metrics.timePattern.fastWrong > 2) {
    feedback +=
      "You're rushing through some challenges. Slow down and review the reference materials carefully. ";
  } else if (metrics.timePattern && metrics.timePattern.slowWrong > 2) {
    feedback +=
      "Take your time to understand each sign. Don't hesitate to replay videos multiple times. ";
  } else if (retryRate > 1.5) {
    feedback +=
      "Try watching the reference videos more carefully before attempting. ";
  } else {
    feedback += "Keep practicing to maintain this great momentum. ";
  }
  feedback += "\n\n";

  feedback += "Keep Going\n";
  if (metrics.performanceTrend === "improving") {
    feedback += "You're improving as you go - that's excellent progress! ";
  }
  feedback +=
    "Sign language mastery comes with consistent practice. You're doing great!";

  return feedback;
}
