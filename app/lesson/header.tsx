import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  percentage: number;
  // DEBUG ONLY - Remove later
  onBack?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalChallenges?: number;
};

export const Header = ({ 
  percentage, 
  onBack, 
  onNext, 
  currentIndex, 
  totalChallenges 
}: HeaderProps) => {
  const { open } = useExitModal();

  return (
    <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px]">
      <X
        onClick={open}
        className="cursor-pointer text-slate-500 transition hover:opacity-75"
      />

      <Progress value={percentage} />

      {/* DEBUG NAVIGATION - Remove later */}
      {onBack && onNext && currentIndex !== undefined && totalChallenges !== undefined && (
        <div className="flex items-center gap-2 rounded-lg border-2 border-orange-500 bg-orange-50 px-3 py-1">
          <Button
            onClick={onBack}
            disabled={currentIndex === 0}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-bold text-orange-700">
            {currentIndex + 1}/{totalChallenges}
          </span>
          <Button
            onClick={onNext}
            disabled={currentIndex >= totalChallenges - 1}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </header>
  );
};
