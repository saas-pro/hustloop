// src/components/testimonials-marquee.tsx
"use client"

import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee1"
import { TestimonialCard } from "./testimonial-card"
import { testimonials } from "@/data/testimonials"

export function TestimonialsMarquee() {
  // Make sure we have enough items for both rows
  const firstRow = [...testimonials, ...testimonials].slice(0, Math.ceil(testimonials.length))
  const secondRow = [...testimonials, ...testimonials].slice(0, Math.ceil(testimonials.length))

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-12">
      {/* First row of testimonials */}
      <Marquee 
        pauseOnHover 
        className="[--duration:40s] py-4"
        reverse={false} // Explicitly set to false
      >
        {firstRow.map((testimonial, index) => (
          <div key={`${testimonial.id}-${index}`} className="mx-4">
            <TestimonialCard {...testimonial} />
          </div>
        ))}
      </Marquee>

      {/* Second row of testimonials (reversed) */}
      <Marquee 
        pauseOnHover 
        className="[--duration:35s] py-4" // Slightly different speed
        reverse={true} // Explicitly set to true
      >
        {secondRow.map((testimonial, index) => (
          <div key={`${testimonial.id}-rev-${index}`} className="mx-4">
            <TestimonialCard {...testimonial} />
          </div>
        ))}
      </Marquee>

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}