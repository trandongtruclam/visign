import { useCallback } from "react";

import Image from "next/image";
import { useAudio, useKey } from "react-use";

import { challenges } from "@/db/schema";
import { cn } from "@/lib/utils";

type CardProps = {
  id: number;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  status?: "correct" | "wrong" | "none";
  disabled?: boolean;
  type: (typeof challenges.$inferSelect)["type"];
};

export const Card = ({
  text, 
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  type,
}: CardProps) => {
  const handleClick = useCallback(() => {
    if (disabled) return;

    onClick();
  }, [disabled, onClick]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full cursor-pointer rounded-xl border-2 border-b-4 p-3 transition-all hover:bg-black/5 active:border-b-2 lg:p-6",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
        selected &&
          status === "correct" &&
          "border-green-300 bg-green-100 hover:bg-green-100",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100",
        disabled && "pointer-events-none hover:bg-white",
        type === "ASSIST" && "w-full lg:p-3",
        // Enhanced styling for VIDEO_SELECT
        type === "VIDEO_SELECT" &&
          "border-3 min-w-[160px] max-w-[220px] flex-1 border-b-[6px] shadow-lg hover:scale-105 hover:shadow-xl",
        type === "VIDEO_SELECT" &&
          !selected &&
          "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50",
        type === "VIDEO_SELECT" && selected && "scale-105 shadow-2xl"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between",
          type === "ASSIST" && "flex-row-reverse",
          type === "VIDEO_SELECT" && "flex-col gap-3"
        )}
      >
        {type === "ASSIST" && <div aria-hidden />}
        <p
          className={cn(
            "text-sm text-neutral-600 lg:text-base",
            selected && "text-sky-500",
            selected && status === "correct" && "text-green-500",
            selected && status === "wrong" && "text-rose-500",
            type === "VIDEO_SELECT" &&
              "text-center text-base font-bold text-neutral-800 lg:text-lg",
            type === "VIDEO_SELECT" && selected && "font-extrabold"
          )}
        >
          {text}
        </p>

        <div
          className={cn(
            "flex h-[15px] w-[15px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
            selected && "border-sky-300 text-sky-500",
            selected &&
              status === "correct" &&
              "border-green-500 text-green-500",
            selected && status === "wrong" && "border-rose-500 text-rose-500",
            type === "VIDEO_SELECT" &&
              "h-[32px] w-[32px] rounded-full text-base font-bold lg:h-[40px] lg:w-[40px] lg:text-xl",
            type === "VIDEO_SELECT" &&
              !selected &&
              "border-gray-400 bg-gray-100"
          )}
        >
          {shortcut}
        </div>
      </div>
    </div>
  );
};
