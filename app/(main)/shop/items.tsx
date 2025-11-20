"use client";

import Image from "next/image";

type ItemsProps = {
  points: number;
};

export const Items = ({ points }: ItemsProps) => {
  return (
    <div className="w-full text-center">
      <div className="flex flex-col items-center gap-y-4 p-8">
        <Image src="/points.svg" alt="Points" height={80} width={80} />
        <h2 className="text-2xl font-bold text-neutral-700">
          You have {points} XP!
        </h2>
        <p className="text-muted-foreground">
          Keep learning to earn more points. No limits, just pure learning! 🎉
        </p>
      </div>
    </div>
  );
};
