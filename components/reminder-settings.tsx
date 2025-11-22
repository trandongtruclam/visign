"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  generateGoogleCalendarLink,
  calculateNextReminderTime,
} from "@/lib/calendar-utils";

export const ReminderSettings = () => {
  const [reminderTime, setReminderTime] = useState("19:00");
  const [enabled, setEnabled] = useState(true);

  const scheduleReminder = () => {
    const nextReminder = calculateNextReminderTime(reminderTime);

    const calendarLink = generateGoogleCalendarLink({
      title: "Practice Sign Language - Visign",
      description: `Time for your daily sign language practice!\n\nKeep your streak going and earn more points.\n\nClick here to start: ${window.location.origin}/learn`,
      startTime: nextReminder,
      duration: 30,
    });

    window.open(calendarLink, "_blank");

    toast.success("Reminder added to Google Calendar!");
  };

  const scheduleWeeklyReminders = () => {
    const nextReminder = calculateNextReminderTime(reminderTime);

    const baseLink =
      "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const title = encodeURIComponent("Practice Sign Language - Visign");
    const description = encodeURIComponent(
      `Time for your daily sign language practice!\n\nKeep your streak going and earn more points.\n\nClick here to start: ${window.location.origin}/learn`
    );

    const startDate = nextReminder
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const startTime = reminderTime.replace(":", "") + "00";
    const endTime =
      new Date(nextReminder.getTime() + 30 * 60000)
        .toTimeString()
        .slice(0, 5)
        .replace(":", "") + "00";

    const recurrenceRule = "FREQ=DAILY";

    const calendarUrl = `${baseLink}&text=${title}&details=${description}&dates=${startDate}T${startTime}/${startDate}T${endTime}&recur=RRULE:${recurrenceRule}`;

    window.open(calendarUrl, "_blank");

    toast.success("Daily recurring reminder added to Google Calendar!");
  };

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Image
          src="/notification.svg"
          alt="notification"
          width={24}
          height={24}
        />
        <h3 className="text-xl font-bold">Practice Reminders</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Set a daily reminder to practice sign language and maintain your streak!
      </p>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* <Clock className="h-5 w-5 text-gray-500" /> */}
          <Image src="/clock.svg" alt="clock" width={24} height={24} />
          <Label htmlFor="time-picker" className="text-sm font-medium">
            Time:
          </Label>
          <Input
            type="time"
            id="time-picker"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Your next reminder will be scheduled for{" "}
            <strong>
              {calculateNextReminderTime(reminderTime).toLocaleString()}
            </strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={scheduleReminder}
          className="w-full"
          variant="primary"
          size="lg"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Add Single Reminder
        </Button>

        <Button
          onClick={scheduleWeeklyReminders}
          className="w-full"
          variant="secondary"
          size="lg"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Add Daily Recurring Reminder
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Reminders will open in Google Calendar. Make
          sure you're signed in to your Google account to save them.
        </p>
      </div>
    </div>
  );
};
