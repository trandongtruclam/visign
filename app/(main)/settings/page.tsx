import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { ReminderSettings } from "@/components/reminder-settings";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress } from "@/db/queries";

const SettingsPage = async () => {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          points={userProgress.points}
        />
      </StickyWrapper>

      <FeedWrapper>
        <div className="mb-5 flex w-full flex-col items-center">
          <h1 className="text-center text-2xl font-bold text-neutral-800">
            Settings
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Manage your learning preferences and reminders
          </p>
        </div>

        <div className="space-y-6">
          <ReminderSettings />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default SettingsPage;

