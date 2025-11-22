"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, TrendingUp, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFeedbackModal } from "@/store/use-feedback-modal";

export const FeedbackModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close, feedback, loading } = useFeedbackModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  const renderFormattedFeedback = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.includes("Strengths") || line.startsWith("1.")) {
        return (
          <div key={index} className="mb-3 flex items-start gap-2">
            <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
            <p className="font-semibold text-green-700">{line}</p>
          </div>
        );
      }
      if (
        line.includes("Areas for Improvement") ||
        line.includes("Improvement") ||
        line.startsWith("2.")
      ) {
        return (
          <div key={index} className="mb-3 flex items-start gap-2">
            <Target className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="font-semibold text-blue-700">{line}</p>
          </div>
        );
      }
      if (
        line.includes("Motivation") ||
        line.includes("Keep Going") ||
        line.startsWith("3.")
      ) {
        return (
          <div key={index} className="mb-3 flex items-start gap-2">
            <Zap className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500" />
            <p className="font-semibold text-orange-700">{line}</p>
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="mb-2 text-gray-700">
          {line}
        </p>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <div className="relative">
              <Image src="/mascot_feedback.svg" alt="Mascot" height={150} width={150} />
            </div>
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            Your Lesson Feedback
          </DialogTitle>

          <DialogDescription className="text-center text-sm text-muted-foreground">
            Personalized insights to help you improve
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Analyzing your performance...
              </p>
            </div>
          ) : (
            <div className="space-y-2">{renderFormattedFeedback(feedback)}</div>
          )}
        </div>

        <DialogFooter className="mb-4">
          <Button
            variant="primary"
            className="w-full"
            size="lg"
            onClick={close}
            disabled={loading}
          >
            Continue Learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
