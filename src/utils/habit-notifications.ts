import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { WeekDay } from "../components/FrequencyPicker";
import type { Habit } from "../types/habit";
import { isHabitScheduledForDate } from "./habit-schedule";

const CHANNEL_ID = "habit-reminders";
const REMINDER_KIND = "habit-reminder";
const NOTIFICATION_WEEKDAY: Record<WeekDay, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function prepareAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Przypomnienia o nawykach",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lightColor: "#8171E8",
  });
}

function hasNotificationPermission(
  permissions: Notifications.NotificationPermissionsStatus
) {
  return (
    permissions.granted ||
    permissions.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestHabitNotificationPermission() {
  if (Platform.OS === "web") {
    return false;
  }

  await prepareAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (hasNotificationPermission(current)) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return hasNotificationPermission(requested);
}

function getReminderTriggers(habit: Habit, now: Date) {
  const { frequency, reminder } = habit;
  const common = {
    hour: reminder.hour,
    minute: reminder.minute,
    channelId: CHANNEL_ID,
  };

  if (
    frequency.type === "daily" ||
    frequency.type === "timesPerWeek"
  ) {
    return [
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        ...common,
      },
    ];
  }

  if (frequency.type === "selectedDays") {
    return frequency.selectedDays.map((day) => ({
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: NOTIFICATION_WEEKDAY[day],
      ...common,
    }));
  }

  for (let offset = 0; offset <= 366; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);

    if (
      !isHabitScheduledForDate(
        frequency,
        date,
        habit.createdAt
      )
    ) {
      continue;
    }

    date.setHours(reminder.hour, reminder.minute, 0, 0);
    if (date > now) {
      return [
        {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: CHANNEL_ID,
        },
      ];
    }
  }

  return [];
}

export async function syncHabitNotifications(habits: Habit[]) {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await prepareAndroidChannel();
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();
    const managed = scheduled.filter(
      (request) =>
        request.content.data?.kind === REMINDER_KIND
    );

    await Promise.all(
      managed.map((request) =>
        Notifications.cancelScheduledNotificationAsync(
          request.identifier
        )
      )
    );

    const permissions = await Notifications.getPermissionsAsync();
    if (!hasNotificationPermission(permissions)) {
      return;
    }

    const now = new Date();
    const enabledHabits = habits.filter(
      (habit) =>
        !habit.archived &&
        habit.reminder.enabled
    );

    for (const habit of enabledHabits) {
      const triggers = getReminderTriggers(habit, now);
      await Promise.all(
        triggers.map((trigger, index) =>
          Notifications.scheduleNotificationAsync({
            content: {
              title: habit.name,
              body: "Czas na wykonanie nawyku",
              data: {
                kind: REMINDER_KIND,
                habitId: habit.id,
              },
            },
            trigger,
            identifier: `${REMINDER_KIND}:${habit.id}:${index}`,
          })
        )
      );
    }
  } catch (error) {
    console.warn(
      "Nie udało się zsynchronizować przypomnień o nawykach:",
      error
    );
  }
}