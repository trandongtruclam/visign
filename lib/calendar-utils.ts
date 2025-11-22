export type CalendarEventParams = {
  title: string;
  description: string;
  startTime: Date;
  duration: number;
  location?: string;
};

export function generateGoogleCalendarLink(
  params: CalendarEventParams
): string {
  const { title, description, startTime, duration, location = "" } = params;

  const endTime = new Date(startTime.getTime() + duration * 60000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.searchParams.set("action", "TEMPLATE");
  calendarUrl.searchParams.set("text", title);
  calendarUrl.searchParams.set("details", description);
  calendarUrl.searchParams.set(
    "dates",
    `${formatDate(startTime)}/${formatDate(endTime)}`
  );
  if (location) calendarUrl.searchParams.set("location", location);

  return calendarUrl.toString();
}

export function calculateNextReminderTime(
  reminderTime: string,
  timezone?: string
): Date {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const nextReminder = new Date();
  nextReminder.setHours(hours, minutes, 0, 0);

  if (nextReminder < new Date()) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  return nextReminder;
}

export function generateRecurringReminders(
  baseTime: Date,
  count: number
): Date[] {
  const reminders: Date[] = [];
  for (let i = 0; i < count; i++) {
    const reminder = new Date(baseTime);
    reminder.setDate(reminder.getDate() + i);
    reminders.push(reminder);
  }
  return reminders;
}

