"use client";

import { useState, useTransition, useEffect } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useAudio, useWindowSize, useMount } from "react-use";
import { toast } from "sonner";

import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { challengeOptions, challenges } from "@/db/schema";
import { useFeedbackModal } from "@/store/use-feedback-modal";
import { usePracticeModal } from "@/store/use-practice-modal";

import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { ResultCard } from "./result-card";
import { SignDetection } from "./sign-detection";
import { VideoLearn } from "./video-learn";

type ChallengeMetric = {
  challengeId: number;
  startTime: number;
  retryCount: number;
  type: string;
};

type QuizProps = {
  initialPercentage: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
};

export const Quiz = ({
  initialPercentage,
  initialLessonId,
  initialLessonChallenges,
}: QuizProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [finishAudio] = useAudio({
    src: "/finish.mp3",
    autoPlay: true,
  });
  const { width, height } = useWindowSize();

  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { open: openPracticeModal } = usePracticeModal();
  const {
    open: openFeedbackModal,
    setFeedback,
    setLoading,
  } = useFeedbackModal();

  useMount(() => {
    if (initialPercentage === 100) openPracticeModal();
  });

  const [lessonId] = useState(initialLessonId);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );

    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"none" | "wrong" | "correct">("none");
  const [isCompleting, setIsCompleting] = useState(false);

  const [lessonStartTime] = useState(Date.now());
  const [challengeMetrics, setChallengeMetrics] = useState<ChallengeMetric[]>(
    []
  );
  const [currentChallengeStartTime, setCurrentChallengeStartTime] =
    useState<number>(Date.now());

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  useEffect(() => {
    if (challenge) {
      const existingMetric = challengeMetrics.find(
        (m) => m.challengeId === challenge.id
      );
      if (!existingMetric) {
        setChallengeMetrics((prev) => [
          ...prev,
          {
            challengeId: challenge.id,
            startTime: Date.now(),
            retryCount: 0,
            type: challenge.type,
          },
        ]);
      }
      setCurrentChallengeStartTime(Date.now());
    }
  }, [challenge?.id]);

  const generateLessonFeedback = async () => {
    const totalTime = Math.floor((Date.now() - lessonStartTime) / 1000);
    const correctFirstTry = challengeMetrics.filter(
      (m) => m.retryCount === 0
    ).length;
    const totalRetries = challengeMetrics.reduce(
      (sum, m) => sum + m.retryCount,
      0
    );

    const metrics = {
      totalChallenges: challenges.length,
      correctFirstTry,
      totalRetries,
      totalTimeSeconds: totalTime,
      pointsEarned: challenges.length * 10,
      challengeDetails: challengeMetrics.map((m) => ({
        type: m.type,
        retries: m.retryCount,
        timeSpent: Math.floor((Date.now() - m.startTime) / 1000),
      })),
    };

    openFeedbackModal("", true);

    try {
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, metrics }),
      });

      if (!response.ok) throw new Error("Failed to generate feedback");

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedback(
        "Great job completing the lesson! Keep practicing to improve your sign language skills."
      );
    }
  };

  useEffect(() => {
    if (!challenge && !isCompleting) {
      setIsCompleting(true);

      generateLessonFeedback();

      const timer = setTimeout(async () => {
        window.location.href = "/learn";
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [challenge, isCompleting]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  // DEBUG ONLY - Remove later
  const onDebugBack = () => {
    setActiveIndex((current) => Math.max(0, current - 1));
    setStatus("none");
    setSelectedOption(undefined);
  };

  const onDebugNext = () => {
    setActiveIndex((current) => Math.min(challenges.length - 1, current + 1));
    setStatus("none");
    setSelectedOption(undefined);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setChallengeMetrics((prev) => {
        const updated = [...prev];
        const currentMetric = updated.find(
          (m) => m.challengeId === challenge.id
        );
        if (currentMetric) {
          currentMetric.retryCount++;
        }
        return updated;
      });
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) return;

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then(() => {
            void correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / challenges.length);
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    } else {
      void incorrectControls.play();
      setStatus("wrong");
    }
  };

  // Handler for VIDEO_LEARN challenges
  const onVideoLearnContinue = () => {
    startTransition(() => {
      upsertChallengeProgress(challenge.id)
        .then(() => {
          setPercentage((prev) => prev + 100 / challenges.length);
          onNext();
        })
        .catch(() => toast.error("Something went wrong. Please try again."));
    });
  };

  // Handler for SIGN_DETECT challenges
  const onSignDetectionComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      // Only update progress and move to next challenge if correct
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then(() => {
            void correctControls.play();
            setPercentage((prev) => prev + 100 / challenges.length);
            setChallengeMetrics((prev) => {
              const updated = [...prev];
              const currentMetric = updated.find(
                (m) => m.challengeId === challenge.id
              );
              // Don't increment retryCount on first success
              return updated;
            });
            // Move to next challenge immediately since SignDetection already shows result
            setTimeout(() => onNext(), 1000);
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    } else {
      // If incorrect, just play sound and track retry - let user retry
      void incorrectControls.play();
      setChallengeMetrics((prev) => {
        const updated = [...prev];
        const currentMetric = updated.find(
          (m) => m.challengeId === challenge.id
        );
        if (currentMetric) {
          currentMetric.retryCount++;
        }
        return updated;
      });
    }
  };

  if (!challenge) {
    return (
      <>
        {finishAudio}
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
            <Image
              src="/finish.svg"
              alt="Finish"
              className="hidden lg:block"
              height={100}
              width={100}
            />

            <Image
              src="/finish.svg"
              alt="Finish"
              className="block lg:hidden"
              height={100}
              width={100}
            />

          <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
            Tuyệt vời! 🎉 <br /> Bạn đã hoàn thành bài học.
          </h1>

          <div className="flex w-full flex-col items-center gap-y-4">
            <ResultCard variant="points" value={challenges.length * 10} />
            <p className="animate-pulse text-sm text-muted-foreground">
              Đang chuyển sang bài tiếp theo...
            </p>
          </div>
        </div>

        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => {
            // Force a hard navigation to ensure fresh data
            window.location.href = "/learn";
          }}
        />
      </>
    );
  }

  // Handle VIDEO_LEARN type
  if (challenge.type === "VIDEO_LEARN") {
    return (
      <>
        {correctAudio}
        <Header
          percentage={percentage}
          onBack={onDebugBack}
          onNext={onDebugNext}
          currentIndex={activeIndex}
          totalChallenges={challenges.length}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <VideoLearn
            videoUrl={challenge.videoUrl || ""}
            question={challenge.question}
            onContinue={onVideoLearnContinue}
          />
        </div>
      </>
    );
  }

  // Handle SIGN_DETECT type
  if (challenge.type === "SIGN_DETECT") {
    return (
      <>
        {incorrectAudio}
        {correctAudio}
        <Header
          percentage={percentage}
          onBack={onDebugBack}
          onNext={onDebugNext}
          currentIndex={activeIndex}
          totalChallenges={challenges.length}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <SignDetection
            videoUrl={challenge.videoUrl || ""}
            targetSign={challenge.question
              .replace('Thực hiện dấu hiệu: "', "")
              .replace('"', "")}
            challengeId={challenge.id}
            onComplete={onSignDetectionComplete}
          />
        </div>
      </>
    );
  }

  // Handle VIDEO_SELECT type (show video, pick from text options)
  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.type === "VIDEO_SELECT"
        ? "Dấu hiệu này có nghĩa là gì?"
        : challenge.question;

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        percentage={percentage}
        onBack={onDebugBack}
        onNext={onDebugNext}
        currentIndex={activeIndex}
        totalChallenges={challenges.length}
      />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {title}
            </h1>

            <div>
              {/* Show video for VIDEO_SELECT type */}
              {challenge.type === "VIDEO_SELECT" && challenge.videoUrl && (
                <div className="mb-6">
                  <div className="aspect-video w-full overflow-hidden rounded-xl border-4 border-blue-500 bg-gray-100 shadow-lg">
                    <iframe
                      src={`${challenge.videoUrl}?autoplay=1&loop=1&title=0&byline=0&portrait=0&badge=0`}
                      className="h-full w-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
