import React from "react";
import { format } from "date-fns";

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
    <div className="relative w-full px-4 py-6">
      <div className="absolute left-[50px] bottom-0 top-0 w-px bg-primary/30" />
      <div className="space-y-8">
        {finalEvents.map((ev, idx) => {
          const isLast = idx === finalEvents.length - 1;

          return (
            <div
              key={ev.id}
              className="grid grid-cols-[72px_1fr] gap-x-4 items-center h-full"
            >
              {/* DOT COLUMN */}
              <div className="relative flex flex-col items-center">

                {/* DOT */}
                <div
                  className={`relative z-10 w-3.5 h-3.5 rounded-full ${ev.isCurrent ? "bg-white border-2 border-primary" : "bg-primary"
                    }`}
                />


                {!isLast && (
                  <div className="absolute top-[50px] left-1/2  w-px bg-primary/30 h-full" />
                )}
              </div>

              <div>
                <div
                  className={`rounded-lg border p-4 shadow-sm transition ${ev.isCurrent
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-gray-200 bg-white"
                    }`}
                >
                  <div className="text-sm text-muted-foreground mb-1">
                    {ev.date ? format(new Date(ev.date), "PPP") : "—"}
                  </div>
                  <div
                    className={`font-semibold ${ev.isCurrent ? "text-primary" : ""
                      }`}
                  >
                    {ev.title}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>

  );
}
