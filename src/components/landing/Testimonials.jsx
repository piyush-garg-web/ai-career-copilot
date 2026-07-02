"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Alex M.",
      role: "Software Engineer",
      avatar: "AM",
      text: "The ATS scoring checker is incredibly precise. I adjusted my resume keywords using the AI suggestions and got responses from three major tech firms within a week! High-quality tool.",
      stars: 5
    },
    {
      name: "Jordan K.",
      role: "Product Manager",
      avatar: "JK",
      text: "The mock interview practice was intense but incredibly realistic. The feedback logs helped me refine my STAR-method behavioral replies. Highly recommend this to any active job seeker.",
      stars: 5
    },
    {
      name: "Sarah L.",
      role: "Data Analyst",
      avatar: "SL",
      text: "I loved the Job Matching tool! It parsed a PDF job posting, compared it with my uploaded resume, and pointed out exactly which database skills were missing. Incredible AI recommendations.",
      stars: 5
    },
    {
      name: "Taylor W.",
      role: "UX Designer",
      avatar: "TW",
      text: "Having multiple resume versions stored in one place with historical score trackers is a game changer. The interface is clean, fast, and works seamlessly in dark mode too.",
      stars: 5
    },
    {
      name: "Casey R.",
      role: "Marketing Manager",
      avatar: "CR",
      text: "The aesthetic grading criteria gave me feedback on formatting issues and typos I didn't even notice myself. It is like having a premium career coach on call 24/7.",
      stars: 5
    },
    {
      name: "Morgan B.",
      role: "DevOps Architect",
      avatar: "MB",
      text: "Simple configuration, secure uploads, and precise suggestions. This app single-handedly saved me hours of research tailoring resumes for job listings. Exceptional value.",
      stars: 5
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Success Stories
          </h2>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Loved by Modern Job Seekers
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Read placeholder reviews from professionals who optimized their profiles, passed filters, and aced their technical panels.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl border border-border/50 bg-card/45 hover:bg-card/75 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 hover:border-indigo-500/15"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center space-x-0.5">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {/* Review Text */}
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
                    {rev.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{rev.name}</h4>
                  <p className="text-xs text-muted-foreground">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
