import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

//
// TIMELINE ROOT
//
export const Timeline = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-8", className)} {...props} />
));
Timeline.displayName = "Timeline";

export const TimelineItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isLast?: boolean;
    isCurrent?: boolean;
    date?: string | null;
    title?: string;
  }
>(({ className, isLast, isCurrent, date, title, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-[40px_1fr] gap-x-4 items-center relative",
      className
    )}
    {...props}
  >
    <div className="relative flex flex-col items-center">

      {/* DOT */}
      <div
        className={cn(
          "relative z-10 w-3.5 h-3.5 rounded-full transition",
          isCurrent
            ? "bg-background border-2 border-primary"
            : "bg-primary"
        )}
      />

      {!isLast && (
        <div
          className="
          group
            absolute 
            top-2
            md:top-3
            left-1/2 
            -translate-x-1/2 
            w-px 
            bg-primary/30 
            h-[calc(100%+6.5rem)]
            md:h-[calc(100%+5.5rem)]
          "
        />
      )}
    </div>

    {/* CARD */}
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm transition",
        isCurrent
          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
          : "border-gray-200"
      )}
    >
      <div className="text-sm text-muted-foreground mb-1">
        {date ? format(new Date(date), "PPP") : "—"}
      </div>

      <div className={cn("font-semibold", isCurrent && "text-primary")}>
        {title}
      </div>

      {children}
    </div>
  </div>
));

TimelineItem.displayName = "TimelineItem";
