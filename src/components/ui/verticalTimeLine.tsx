import React from "react";
import { format } from "date-fns";
import {
  Timeline,
  TimelineItem
} from './timeline';

type EventItem = {
  id: string;
  date: string | null;
  title: string;
  isCurrent?: boolean;
};

export default function VerticalTimeline({
  timeline,
}: {
  timeline: {
    startDate: string;
    underReview: string;
    verification: string;
  };
}) {
  const events: EventItem[] = [
    { id: "start", date: timeline.startDate, title: "Application Started" },
    { id: "review", date: timeline.underReview, title: "Under Review" },
    { id: "verification", date: timeline.verification, title: "Verification" },
    { id: "ended", date: null, title: "Ended" },
  ];
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

  const finalEvents = events.map((ev, idx) => ({
    ...ev,
    isCurrent: idx === currentIndex,
  }));

  return (
    <Timeline className="w-2/3">
      {finalEvents.map((ev, i) => (
        <TimelineItem
          key={ev.id}
          date={ev.date}
          title={ev.title}
          isCurrent={ev.isCurrent}
          isLast={i === events.length - 1}
        />
      ))}
    </Timeline>

  );
}
