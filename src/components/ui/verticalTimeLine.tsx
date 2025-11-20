import React from "react";
import { Timeline, TimelineItem } from "./timeline";

type EventItem = {
  id: string;
  date: string | null;
  title: string;
  isCurrent?: boolean;
  color?: string;
};

export default function VerticalTimeline({
  timeline,
}: {
  timeline: {
    application_started: string;
    application_ended: string;
    review_started: string;
    review_ended: string;
    screening_started: string;
    screening_ended: string;
    extended_end_date?: string | null;
    challenge_close?: boolean | string;
  };
}) {
  const isClosed =
    timeline.challenge_close === true ||
    timeline.challenge_close === "stopped" ||
    timeline.challenge_close === "expired";

  const events: EventItem[] = [
    {
      id: "application_started",
      date: timeline.application_started,
      title: "Application Started",
    },
    {
      id: "application_ended",
      date: timeline.application_ended,
      title: "Application Ended",
    },

    timeline.extended_end_date
      ? {
        id: "extended_end_date",
        date: timeline.extended_end_date,
        title: "Extended End Date",
      }
      : null,

    {
      id: "review_started",
      date: timeline.review_started,
      title: "Review Started",
    },
    {
      id: "review_ended",
      date: timeline.review_ended,
      title: "Review Ended",
    },
    {
      id: "screening_started",
      date: timeline.screening_started,
      title: "Screening Started",
    },
    {
      id: "screening_ended",
      date: timeline.screening_ended,
      title: "Screening Ended",
    },
  ].filter(Boolean) as EventItem[];

  const safeDate = (value: string | null) =>
    value ? new Date(value) : null;

  const now = new Date();
  let currentIndex = 0;

  for (let i = 0; i < events.length; i++) {
    const currentDate = safeDate(events[i].date);
    const nextDate = safeDate(events[i + 1]?.date ?? null);

    if (!currentDate) {
      currentIndex = i;
      break;
    }

    if (!nextDate) {
      if (now >= currentDate) currentIndex = i;
      break;
    }

    if (now >= currentDate && now < nextDate) {
      currentIndex = i;
      break;
    }
  }

  const finalEvents = events.map((ev, idx) => {
    const d = safeDate(ev.date);
    let color = "text-gray-400";

    if (d) {
      if (d < now) color = "text-red-500";
      if (idx === currentIndex) color = "text-primary font-semibold";
      if (d > now) color = "text-gray-400";
    }

    return {
      ...ev,
      isCurrent: idx === currentIndex,
      color,
    };
  });

  return (
    <Timeline className="w-2/3">
      {finalEvents.map((ev, i) => (
        <TimelineItem
          key={ev.id}
          date={ev.date}
          title={ev.title}
          isCurrent={ev.isCurrent}
          color={ev.color}
          isLast={i === finalEvents.length - 1}
          challengeClose={isClosed}
        />
      ))}
    </Timeline>
  );
}
