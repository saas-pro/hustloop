'use client';

import {
  Rocket,
  Lightbulb,
  Briefcase,
  Award,
  GraduationCap,
  Search,
  Target,
  TrendingUp,
  Scaling,
  CircleDollarSign,
  Handshake,
  BarChart,
  Wrench,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

const solutionSteps = {
  incubation: {
    title: 'Incubation Journey',
    steps: [
      { icon: Rocket, title: 'Entrepreneur', description: 'Start Your Journey with a Vision' },
      { icon: Lightbulb, title: 'Innovative Idea', description: 'Submit Your Groundbreaking Concept' },
      { icon: Briefcase, title: 'Incubation Support', description: 'Get Expert Guidance & Resources' },
      { icon: Award, title: 'MVP Development', description: 'Build, Test, and Refine Your Solution' },
      { icon: GraduationCap, title: 'Success', description: 'Graduate from the Program & Scale' },
    ],
  },
  'market-solution': {
    title: 'Market Solution Path',
    steps: [
      { icon: Search, title: 'Market Analysis', description: 'Identify Your Target Audience & Niche' },
      { icon: Target, title: 'Product Validation', description: 'Confirm Product-Market Fit with Real Users' },
      { icon: TrendingUp, title: 'Go-to-Market', description: 'Develop a Winning Launch Strategy' },
      { icon: Scaling, title: 'Launch & Iterate', description: 'Execute, Measure Your KPIs, and Adapt' },
      { icon: CircleDollarSign, title: 'Scale & Grow', description: 'Expand Your User Base and Revenue' },
    ],
  },
  partnership: {
    title: 'Partnership Roadmap',
    steps: [
      { icon: Handshake, title: 'Partner Discovery', description: 'Identify and Vet Strategic Partners' },
      { icon: BarChart, title: 'Value Proposition', description: 'Connect with MSMEs and Corporates' },
      { icon: Wrench, title: 'Pilot Program', description: 'Forge Pilot Projects to Prove Value' },
      { icon: GitBranch, title: 'Integration', description: 'Align Goals and Grow Together' },
      { icon: ShieldCheck, title: 'Long-Term Synergy', description: 'Achieve Mutual and Lasting Success' },
    ],
  },
};

export default function SolutionHeroSection() {
  return (
    <section className="bg-background dark:bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Empowering Every Step of Your Startup Journey
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-16">
          Whether you're an emerging founder, scaling your product, or seeking strategic partnerships — Hustloop guides you through every stage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {Object.entries(solutionSteps).map(([key, section]) => (
            <div key={key}>
              <motion.h3
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-semibold mb-6 text-primary"
              >
                {section.title}
              </motion.h3>

              <ul className="space-y-4">
                {section.steps.map(({ icon: Icon, title, description }, idx) => (
                  <motion.li
                    key={title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <Icon className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
