"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";

type ChallengeMetrics = {
  retryCount: number;
  timeSpentSeconds: number;
};

export const upsertChallengeProgress = async (
  challengeId: number,
  metrics?: ChallengeMetrics
) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    const updateData: any = {
      completed: true,
    };

    // Update metrics if provided
    if (metrics) {
      updateData.retryCount = (existingChallengeProgress.retryCount || 0) + metrics.retryCount;
      updateData.timeSpentSeconds = (existingChallengeProgress.timeSpentSeconds || 0) + metrics.timeSpentSeconds;
    }

    await db
      .update(challengeProgress)
      .set(updateData)
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    await db
      .update(userProgress)
      .set({
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, userId));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  // Insert new challenge progress with metrics
  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
    retryCount: metrics?.retryCount || 0,
    timeSpentSeconds: metrics?.timeSpentSeconds || 0,
  });

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
