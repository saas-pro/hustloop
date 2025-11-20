import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Timeline = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Timeline.displayName = "Timeline";

export const TimelineItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isLast?: boolean;
    isCurrent?: boolean;
    date?: string | null;
    title?: string;
    challengeClose?: boolean;
  }
>(({ className, isLast, isCurrent, date, title, children, challengeClose, ...props }, ref) => {

  const eventDate = date ? new Date(date) : null;
  const now = new Date();

  let state: "past" | "current" | "future" = "future";

  if (isCurrent) state = "current";
  else if (eventDate && eventDate < now) state = "past";

  const dotClasses =
    state === "current"
      ? "bg-primary border-2 border-primary"
      : state === "past"
      ? "bg-red-500"
      : "border border-gray-400 bg-gray-200";

  const cardClasses =
    state === "current"
      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
      : state === "past"
      ? "border-red-400 bg-red-50"
      : "border-gray-300 bg-gray-50 text-gray-400";

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-[32px_1fr] gap-x-2 relative",
        className
      )}
      {...props}
    >

      <div className="relative flex flex-col items-center top-9 left-2">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[16px] bg-primary/30" />

        <div
          className={cn("relative z-10 w-3.5 h-3.5 rounded-full", dotClasses)}
        />

        {!isLast && (
          <div className="absolute top-4 bottom-0 left-1/2 -translate-x-1/2 w-px bg-primary/30" />
        )}
      </div>

      {/* CARD + HORIZONTAL CONNECTOR */}
      <div className="relative pb-8">

        {/* horizontal line exactly into the card */}
        <div className="absolute left-[-16px] top-10 w-4 h-px bg-primary/30" />

        <div
          className={cn(
            "relative border rounded-lg p-4 shadow-sm transition",
            cardClasses,
            challengeClose && "border-red-400"
          )}
        >
          <div className="text-sm text-muted-foreground mb-1">
            {date ? format(new Date(date), "PPP") : "—"}
          </div>

          <div className={cn("font-semibold", state === "current" && "text-primary")}>
            {title}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
});

TimelineItem.displayName = "TimelineItem";

