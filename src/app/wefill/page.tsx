"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Footer from '@/components/layout/footer';
import type { View } from '@/app/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Paperclip, CheckCircle2, CornerDownLeft, Sparkles, UploadCloud, ChevronRight, Home, Sun, Moon, Palette } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import CurvedLoop from '@/components/CurvedLoop';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import BrandLogo from '@/components/blog/brand-logo';

const LETTERS = 'abcdefghi';

const Q = [
  {
    type: 'welcome', title: `Fill it <em className='not-italic text-primary'>once.</em><br>We apply everywhere.`,
    sub: `A few questions about your startup. WeFill reshapes your answers into every event, hackathon, grant & scheme's format - and submits for you. Takes about 4 minutes.`,
    cta: `Start`
  },
  { sec: 'Company', name: 'legal_name', q: `What's your startup's legal name?`, req: true, ph: `Hustloop Pvt Ltd` },
  { sec: 'Company', name: 'brand_name', q: `And the brand name you go by?`, req: true, ph: `Hustloop` },
  { sec: 'Company', name: 'website', q: `Your website?`, sub: `Leave blank if you don't have one yet.`, input: 'url', ph: `https://hustloop.com` },
  { sec: 'Company', name: 'entity_type', q: `How is it incorporated?`, req: true, choice: ['Private Limited', 'LLP', 'OPC', 'Partnership', 'Proprietorship', 'Not yet incorporated'] },
  { sec: 'Company', name: 'incorp_date', q: `When was it incorporated?`, input: 'date', sub: `Skip if not yet incorporated.` },
  {
    sec: 'Company', name: 'reg', q: `Your registration numbers`, sub: `Whatever you have - the rest we can fill later.`, multi: [
      { name: 'reg_cin', ph: 'CIN' }, { name: 'reg_gst', ph: 'GST no.' }, { name: 'reg_pan', ph: 'PAN (required)', req: true }, { name: 'reg_udyam', ph: 'Udyam / MSME no.' }]
  },
  { sec: 'Company', name: 'address', q: `Registered address?`, req: true, textarea: true, ph: `Street, city, state, PIN` },
  { sec: 'Company', name: 'sector', q: `Which sector best fits you?`, req: true, choice: ['SaaS / Software', 'Fintech', 'Healthtech', 'Edtech', 'D2C / Consumer', 'Deeptech / AI', 'Climate / Energy', 'Other'] },
  { sec: 'Company', name: 'stage', q: `What stage are you at?`, req: true, choice: ['Idea', 'Pre-seed', 'Seed', 'Pre-Series A', 'Series A+'] },
  { sec: 'Founders', name: 'founder_name', q: `Who's the primary founder?`, req: true, ph: `Full name` },
  { sec: 'Founders', name: 'founder_role', q: `Their role?`, req: true, ph: `CEO & Co-founder` },
  {
    sec: 'Founders', name: 'contact', q: `How do we reach you?`, multi: [
      { name: 'founder_email', ph: 'Email (required)', input: 'email', req: true },
      { name: 'founder_phone', ph: 'Phone (required)', input: 'tel', req: true },
      { name: 'founder_linkedin', ph: 'LinkedIn URL', input: 'url' }]
  },
  { sec: 'Founders', name: 'founder_bio', q: `A one-line founder bio`, sub: `Reused across applications. Keep it punchy.`, textarea: true, max: 150, ph: `Ex-Flipkart PM. Built two 0→1 products.` },
  { sec: 'Founders', name: 'cofounders', q: `Any co-founders?`, sub: `Comma separated. Skip if solo.`, ph: `Name - role, Name - role` },
  { sec: 'Founders', name: 'team_size', q: `How big is the team?`, req: true, choice: ['1–2', '3–5', '6–10', '11–25', '25+'] },
  { sec: 'Founders', name: 'doc_id_proof', q: `Founder ID proof`, sub: `Aadhaar or passport. Optional now - you can add later.`, upload: [{ label: 'ID proof', hint: 'PDF, JPG', accept: '.pdf,.jpg,.png', name: 'doc_id_proof' }] },
  {
    sec: 'Traction', name: 'traction', q: `Your traction so far`, sub: `Rough numbers are fine.`, multi: [
      { name: 'revenue', ph: 'Monthly revenue (₹)' }, { name: 'users', ph: 'Users / customers' }, { name: 'growth', ph: 'Growth rate (MoM %)' }]
  },
  {
    sec: 'Traction', name: 'funding', q: `Funding picture`, multi: [
      { name: 'funding_raised', ph: 'Total raised (₹)' },
      { name: 'round_size', ph: 'Target round size (₹)' }]
  },
  { sec: 'Traction', name: 'current_round', q: `Are you currently raising?`, choice: ['Not raising', 'Pre-seed', 'Seed', 'Bridge', 'Series A'] },
  { sec: 'Traction', name: 'cap_table', q: `Cap table summary`, sub: `Optional. A one-liner is enough.`, textarea: true, ph: `Founders 80%, ESOP 10%, Angels 10%` },
  { sec: 'Traction', name: 'key_metrics', q: `Any key metrics you track?`, sub: `Optional.`, ph: `CAC, LTV, retention, burn, runway…` },
  { sec: 'Pitch', name: 'one_liner', q: `Your one-liner`, req: true, ph: `We build innovative software for everyone.` },
  { sec: 'Pitch', name: 'problem', q: `What problem do you solve?`, req: true, textarea: true, ph: `The painful problem, and for whom.` },
  { sec: 'Pitch', name: 'solution', q: `And how do you solve it?`, req: true, textarea: true, ph: `Your solution, and why now.` },
  {
    sec: 'Pitch', name: 'descriptions', q: `Describe your startup, three lengths`, sub: `Every form asks for a different word count. Fill what you can.`, multi: [
      { name: 'desc_30', ph: '~30 words', textarea: true, max: 220 },
      { name: 'desc_60', ph: '~60 words', textarea: true, max: 440 },
      { name: 'desc_150', ph: '~150 words', textarea: true, max: 1100 }]
  },
  {
    sec: 'Pitch', name: 'product', q: `Product details`, multi: [
      { name: 'demo_link', ph: 'Demo link', input: 'url' },
      { name: 'tech_stack', ph: 'Tech stack' },
      { name: 'ip_patents', ph: 'IP / patents (optional)' }]
  },
  {
    sec: 'Documents', name: 'docs', q: `Upload your documents`, sub: `Once here, reused on every application. Add what you have.`, upload: [
      { label: 'Incorporation cert', hint: 'PDF', accept: '.pdf', name: 'doc_incorp_cert' },
      { label: 'GST & PAN', hint: 'PDF, JPG', accept: '.pdf,.jpg,.png', name: 'doc_gst_pan' },
      { label: 'Udyam cert', hint: 'PDF', accept: '.pdf', name: 'doc_udyam_cert' },
      { label: 'Pitch deck', hint: 'PDF, PPT', accept: '.pdf,.ppt,.pptx', name: 'doc_pitch_deck' },
      { label: 'One-pager', hint: 'PDF', accept: '.pdf', name: 'doc_one_pager' },
      { label: 'Financials', hint: 'PDF, XLS', accept: '.pdf,.xls,.xlsx', name: 'doc_financials' }]
  },
  { sec: 'Documents', name: 'apply_for', q: `What should we apply to for you?`, sub: `Pick any. We match within these.`, multichoice: ['Events & expos', 'Hackathons', 'Funding & schemes', 'Accelerators', 'Awards', 'Certifications', 'Pitch competitions', 'Grants & fellowships', 'Vendor listings'] },
  { type: 'review' },
  { type: 'done' }
];

const qIdx = Q.map((q, idx) => ({ q, idx })).filter(o => !o.q.type).map(o => o.idx);

function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();
  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'purple', label: 'Purple', icon: Palette },
    { value: 'blue', label: 'Blue', icon: Palette },
    { value: 'green', label: 'Green', icon: Palette },
    { value: 'orange', label: 'Orange', icon: Palette },
    { value: 'blue-gray', label: 'Blue Gray', icon: Palette },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
            <option.icon className="mr-2 h-4 w-4" />
            <span>{option.label}</span>
            {theme === option.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const AnimatedBackground = () => (
  <div className="absolute top-20 inset-0 z-0 overflow-hidden pointer-events-none flex flex-col justify-center items-center opacity-30">
    <CurvedLoop
      marqueeText="HUSTLOOP - STARTUPS - INNOVATE - WEFILL - PITCH - "
      speed={1.5}
      className="text-primary opacity-80"
    />
    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
  </div>
);

export default function WeFillPage() {
  const [navOpen, setNavOpen] = React.useState(false);
  const headerProps = {
    activeView: 'dashboard' as View,
    setActiveView: () => { },
    isLoggedIn: false,
    onLogout: () => { },
    isLoading: false,
    isStaticPage: true,
    navOpen,
    setNavOpen,
    heroVisible: false,
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<any>({});

  const router = useRouter();

  const handleInputChange = useCallback((name: string, value: any) => {
    setData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => {
      if (prev[name]) {
        return { ...prev, [name]: '' };
      }
      return prev;
    });
  }, []);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const validate = useCallback(() => {
    const q = Q[currentStep];
    if (q.type) return true;

    let valid = true;
    let newErrors: any = {};
    const currentData = dataRef.current;

    if (q.choice && q.req && !currentData[q.name]) {
      newErrors[q.name] = 'Please pick one to continue.';
      valid = false;
    }
    const checkField = (field: any) => {
      const val = currentData[field.name]?.trim() || '';
      if (field.req && !val) {
        newErrors[field.name] = 'This field is required.';
        valid = false;
      } else if (val) {
        if (field.input === 'email' || field.name.includes('email')) {
          const parsed = z.string().email('Please enter a valid email address.').safeParse(val);
          if (!parsed.success) {
            newErrors[field.name] = parsed.error.issues[0].message;
            valid = false;
          }
        }
        if (field.input === 'tel' || field.name.includes('phone')) {
          const parsed = z.string().regex(/^\+?[0-9\s\-()]{7,15}$/, 'Please enter a valid phone number.').safeParse(val);
          if (!parsed.success) {
            newErrors[field.name] = parsed.error.issues[0].message;
            valid = false;
          }
        }
      }
    };

    if (q.multi) {
      for (const m of q.multi) {
        checkField(m);
      }
    } else if (!q.choice && !q.multichoice && !q.upload) {
      checkField(q);
    }

    setErrors(newErrors);
    return valid;
  }, [currentStep]);

  const advance = useCallback(() => {
    if (validate() && currentStep < Q.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validate]);

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const submitForm = useCallback(async () => {
    if (!consent) {
      setErrors((prev: any) => ({ ...prev, consent: 'Please tick the authorization box to submit.' }));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const val = data[key];
        if (val instanceof File) {
          formData.append(key, val);
        } else if (Array.isArray(val)) {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, val);
        }
      });

      const res = await fetch('http://localhost:5000/api/wefill/apply', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        advance();
      } else {
        const err = await res.json();
        setErrors((prev: any) => ({ ...prev, submit: err.error || 'An error occurred during submission.' }));
      }
    } catch (err) {
      setErrors((prev: any) => ({ ...prev, submit: 'Network error. Please try again.' }));
    }

    setIsSubmitting(false);
  }, [consent, data, advance]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const q = Q[currentStep];
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const inTextarea = tag === 'textarea';

      if (q && q.choice && /^[a-i]$/i.test(e.key) && tag !== 'input') {
        const ci = LETTERS.indexOf(e.key.toLowerCase());
        const choice = q.choice[ci];
        if (choice) {
          handleInputChange(q.name, choice);
          setTimeout(() => advance(), 260);
          e.preventDefault();
        }
      }

      if (e.key === 'Enter') {
        if (inTextarea && !e.shiftKey) {
          e.preventDefault();
          advance();
        } else if (!inTextarea) {
          e.preventDefault();
          if (q && q.type === 'review') {
            submitForm();
          } else if (q && q.type !== 'done') {
            advance();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, data, advance, handleInputChange, submitForm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0];
    if (!file) {
      const newData = { ...data };
      delete newData[name];
      setData(newData);
      return;
    }
    setData((prev: any) => ({ ...prev, [name]: file }));
  };

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction) => ({
      zIndex: 0,
      y: direction > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    })
  };

  const renderSlideContent = (q: any, idx: number) => {
    const reqStar = q.req ? <sup className="text-primary text-[0.6em] ml-0.5">✱</sup> : null;

    if (q.type === 'welcome') {
      return (
        <div className="flex flex-col h-full justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold leading-[1.05] tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" dangerouslySetInnerHTML={{ __html: q.title }}></h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg md:text-xl mb-10 max-w-[56ch] leading-relaxed">
            {q.sub}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center gap-4">
            <button className="group flex items-center gap-2 text-[17px] font-semibold bg-primary text-primary-foreground border-none rounded-full px-8 py-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0" onClick={advance}>
              {q.cta}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-sm text-muted-foreground/60 flex items-center gap-2">
              press <kbd className="font-sans px-2 py-1 rounded bg-muted/50 border border-border text-foreground">Enter ↵</kbd>
            </span>
          </motion.div>
        </div>
      );
    }

    if (q.type === 'review') {
      return (
        <div className="flex flex-col h-full py-4">
          <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3 tracking-wide text-sm uppercase">
            <Sparkles className="w-4 h-4" /> Almost there
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">Review &amp; submit</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-[56ch]">Confirm the essentials. Tap Edit to jump back to any answer.</p>

          <div className="grid gap-3 max-w-2xl mb-8">
            {[
              ['Company', [data.brand_name, data.entity_type, data.sector, data.stage].filter(Boolean).join(' · '), 1],
              ['Founder', [data.founder_name, data.founder_role, data.founder_email].filter(Boolean).join(' · '), 10],
              ['Traction', [data.revenue && ('₹' + data.revenue), data.users, data.current_round].filter(Boolean).join(' · '), 17],
              ['Pitch', [data.one_liner].filter(Boolean).join(' · '), 23],
              ['Applying for', Array.isArray(data.apply_for) && data.apply_for.length ? data.apply_for.join(' · ') : 'All matched categories', 29],
            ].map(([title, val, jump], ri) => (
              <motion.div key={ri} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.05 }} className="group border border-border/60 hover:border-border rounded-xl p-4 bg-card/40 hover:bg-card/80 transition-all flex justify-between gap-4 items-center backdrop-blur-sm">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">{title}</h4>
                  <p className="text-[15px] font-medium leading-relaxed">{val || <span className="text-destructive/80 italic">Not filled yet</span>}</p>
                </div>
                <button className="text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md" onClick={() => goToStep(jump as number)}>Edit</button>
              </motion.div>
            ))}
          </div>

          <label className="flex gap-3 items-start mb-6 text-[15px] text-muted-foreground max-w-2xl cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
              <input type="checkbox" className="peer w-5 h-5 opacity-0 absolute inset-0 cursor-pointer" checked={consent} onChange={(e) => {
                setConsent(e.target.checked);
                setErrors((prev: any) => ({ ...prev, consent: '' }));
              }} />
              <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded flex items-center justify-center transition-colors peer-checked:border-primary peer-checked:bg-primary peer-hover:border-primary/60">
                <Check className={`w-3.5 h-3.5 text-primary-foreground transition-transform scale-0 peer-checked:scale-100`} strokeWidth={3} />
              </div>
            </div>
            <span className="group-hover:text-foreground transition-colors leading-relaxed">I authorize WeFill to reformat and submit my startup&apos;s details to matched opportunities on my behalf.</span>
          </label>

          {errors.consent && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-destructive text-sm font-medium mb-4">{errors.consent}</motion.div>}
          {errors.submit && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-destructive text-sm font-medium mb-4">{errors.submit}</motion.div>}

          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-2 text-[16px] font-semibold bg-primary text-primary-foreground border-none rounded-full px-8 py-3.5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none" onClick={submitForm} disabled={isSubmitting || !consent}>
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Submitting...</>
              ) : (
                <>Submit registration <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      );
    }

    if (q.type === 'done') {
      return (
        <div className="flex flex-col h-full mt-10 justify-center items-center text-center mx-auto max-w-lg">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="w-16 h-16 rounded-full p-3 bg-primary/10 text-primary flex items-center justify-center mb-8 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5">You&apos;re in.</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-[17px] mb-10 leading-relaxed">Your startup profile is saved. From here, WeFill does the filling - you just show up and pitch.</motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid gap-6 mt-4 w-full text-left">
            {[
              { num: '1', title: 'We match', desc: 'events, hackathons, grants & schemes that fit your stage and sector.' },
              { num: '2', title: 'We reformat & apply', desc: '- your details reshaped into each form\'s template and submitted.' },
              { num: '3', title: 'You show up', desc: 'and pitch. We get you the entry.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="flex-none w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold mt-0.5">{step.num}</span>
                <span className="text-[15px] text-muted-foreground leading-relaxed"><strong className="text-foreground font-semibold">{step.title}</strong> {step.desc}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12">
            <button className="text-[16px] font-semibold bg-secondary text-secondary-foreground border border-border/50 rounded-full px-8 py-3.5 cursor-pointer transition-all hover:bg-secondary/80 shadow-sm" onClick={() => window.location.reload()}>Register another startup</button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full max-w-2xl mx-auto justify-center min-h-full py-8">
        <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4 tracking-wide text-sm uppercase">
          <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/15 text-primary text-xs">{qIdx.indexOf(idx) + 1}</span>
          <ChevronRight className="w-4 h-4 text-primary/50 -mx-1" />
          {q.sec}
        </div>

        <h2 className="text-3xl md:text-[38px] font-bold leading-[1.2] mb-3">{q.q}{reqStar}</h2>
        {q.sub && <p className="text-muted-foreground text-[17px] mb-8 max-w-[56ch] leading-relaxed">{q.sub}</p>}
        {!q.sub && <div className="mb-8" />}

        {/* Choices */}
        {q.choice && (
          <div className="grid gap-3 max-w-xl">
            {q.choice.map((c: string, ci: number) => {
              const sel = data[q.name] === c;
              return (
                <div key={c} className={`group relative flex items-center gap-4 border-[1.5px] rounded-xl py-3.5 px-5 cursor-pointer select-none transition-all duration-200 text-[16px] overflow-hidden ${sel ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-border/60 bg-card hover:border-primary/50 hover:bg-primary/[0.02]'}`} onClick={() => {
                  handleInputChange(q.name, c);
                  setTimeout(() => advance(), 300);
                }}>
                  {sel && <motion.div layoutId="choice-bg" className="absolute inset-0 bg-primary/10" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                  <span className={`relative z-10 flex-none w-[28px] h-[28px] rounded-md border-[1.5px] flex items-center justify-center text-[13px] font-bold uppercase transition-colors ${sel ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50'}`}>{LETTERS[ci]}</span>
                  <span className={`relative z-10 font-medium ${sel ? 'text-primary' : 'text-foreground'}`}>{c}</span>
                  <span className={`relative z-10 ml-auto transition-opacity duration-200 ${sel ? 'opacity-100 text-primary' : 'opacity-0'}`}><Check className="w-5 h-5" /></span>
                </div>
              );
            })}
          </div>
        )}

        {/* Multi-choices */}
        {q.multichoice && (
          <div className="grid gap-3 max-w-xl">
            {q.multichoice.map((c: string, ci: number) => {
              const sel = (data[q.name] || []).includes(c);
              return (
                <div key={c} className={`group flex items-center gap-4 border-[1.5px] rounded-xl py-3.5 px-5 cursor-pointer select-none transition-all duration-200 text-[16px] ${sel ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-border/60 bg-card hover:border-primary/50 hover:bg-primary/[0.02]'}`} onClick={() => {
                  const arr = data[q.name] || [];
                  handleInputChange(q.name, sel ? arr.filter((x: string) => x !== c) : [...arr, c]);
                }}>
                  <span className={`flex-none w-[28px] h-[28px] rounded-md border-[1.5px] flex items-center justify-center text-[13px] font-bold uppercase transition-colors ${sel ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50'}`}>{LETTERS[ci]}</span>
                  <span className={`font-medium ${sel ? 'text-primary' : 'text-foreground'}`}>{c}</span>
                  <span className={`ml-auto transition-opacity duration-200 ${sel ? 'opacity-100 text-primary' : 'opacity-0'}`}><Check className="w-5 h-5" /></span>
                </div>
              );
            })}
          </div>
        )}

        {/* Uploads */}
        {q.upload && (
          <div className="grid gap-4 max-w-xl">
            {q.upload.map((u: any, ui: number) => {
              const isFilled = !!data[u.name];
              const isUploading = uploadingFiles[u.name];
              return (
                <label key={ui} className={`group relative flex items-center gap-5 border-2 border-dashed rounded-xl py-5 px-6 cursor-pointer transition-all duration-200 ${isFilled ? 'border-primary bg-primary/5' : 'border-border/60 bg-card/50 hover:border-primary/50 hover:bg-card'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isFilled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    {isFilled ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <b className="text-[16px] font-semibold block mb-0.5">{u.label}</b>
                    <span className={`text-[13px] font-medium ${isFilled ? "text-primary" : "text-muted-foreground/70"}`}>
                      {isUploading ? 'Uploading...' : (isFilled ? data[u.name]?.name || 'File selected' : u.hint)}
                    </span>
                  </div>
                  <input type="file" className="hidden" accept={u.accept || ''} onChange={(e) => handleFileUpload(e, u.name)} disabled={isUploading} />
                </label>
              );
            })}
          </div>
        )}

        {/* Multi-inputs */}
        {q.multi && (
          <div className="grid gap-8 w-full">
            {q.multi.map((m: any) => {
              const val = data[m.name] || '';
              return (
                <div key={m.name} className="relative">
                  {m.textarea ? (
                    <textarea className="w-full bg-transparent border-b-2 border-border/60 text-foreground text-2xl font-normal px-0 pt-2 pb-3 transition-colors duration-200 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary resize-none peer" placeholder={m.ph} maxLength={m.max} rows={1}
                      value={val} onChange={(e) => {
                        handleInputChange(m.name, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }} />
                  ) : (
                    <input className="w-full bg-transparent border-b-2 border-border/60 text-foreground text-2xl md:text-[28px] font-normal px-0 pt-2 pb-3 transition-colors duration-200 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary peer" type={m.input || 'text'} placeholder={m.ph} maxLength={m.max}
                      value={val} onChange={(e) => handleInputChange(m.name, e.target.value)} />
                  )}
                  {val && <div className="absolute right-0 bottom-4 text-primary scale-in-center"><Check className="w-6 h-6" /></div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Single Input / Textarea */}
        {q.textarea && !q.multi && (
          <div className="relative w-full">
            <textarea className="w-full bg-transparent border-b-2 border-border/60 text-foreground text-2xl md:text-[28px] font-normal px-0 pt-2 pb-3 transition-colors duration-200 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary resize-none peer" placeholder={q.ph || ''} maxLength={q.max} rows={1}
              value={data[q.name] || ''} onChange={(e) => {
                handleInputChange(q.name, e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }} />
          </div>
        )}
        {!q.choice && !q.multichoice && !q.upload && !q.multi && !q.textarea && (
          <div className="relative w-full">
            <input className="w-full bg-transparent border-b-2 border-border/60 text-foreground text-2xl md:text-[28px] font-normal px-0 pt-2 pb-3 transition-colors duration-200 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary peer" type={q.input || 'text'} placeholder={q.ph || ''}
              value={data[q.name] || ''} onChange={(e) => handleInputChange(q.name, e.target.value)} />
          </div>
        )}

        {/* Errors */}
        <AnimatePresence>
          {(errors[q.name] || Object.keys(errors).some(k => q.multi?.some((m: any) => m.name === k))) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-sm mt-3 font-medium overflow-hidden">
              <div className="py-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {errors[q.name] || q.multi?.map((m: any) => errors[m.name]).filter(Boolean)[0]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-start gap-4 mt-8 w-full md:w-auto">
          <button className="flex items-center gap-2 text-[16px] font-semibold bg-primary text-primary-foreground border-none rounded-full px-7 py-3 cursor-pointer transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" onClick={advance}>
            OK <Check className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground/60 flex items-center gap-2">
            press <kbd className="font-sans px-2 py-1 rounded bg-muted/50 border border-border text-foreground">Enter <CornerDownLeft className="inline w-3 h-3 ml-0.5" /></kbd>
          </span>
        </div>
      </div>
    );
  };

  const pos = qIdx.indexOf(currentStep) + 1;
  const total = qIdx.length;
  let progressWidth = 0;
  let stepText = '';

  if (Q[currentStep]?.type === 'welcome') {
    progressWidth = 0;
  } else if (Q[currentStep]?.type === 'done') {
    progressWidth = 100;
    stepText = 'Done';
  } else if (Q[currentStep]?.type === 'review') {
    progressWidth = 100;
    stepText = 'Review';
  } else {
    progressWidth = (pos / total) * 100;
    stepText = `${pos} of ${total}`;
  }

  return (
    <div className="overflow-hidden relative flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BrandLogo />
            </div>
            <ThemeToggleDropdown />
          </div>
        </div>
      </header>
      <div className={`flex-grow bg-background min-h-screen relative z-40 m-auto pointer-events-auto w-full flex flex-col justify-center py-16 md:py-24`}
        data-alt-id="card-anchor"
        id="main-view1"
      >

        {/* Modern Progress Bar */}
        <div className="fixed top-[82px] left-0 right-0 h-[3px] bg-muted z-40">
          <motion.div className="h-full bg-primary origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: progressWidth / 100 }} transition={{ duration: 0.5, ease: "easeOut" }} />
        </div>

        {/* Top Branding / Nav Area */}
        <div className="fixed top-[82px] left-0 right-0 z-30 items-center justify-between px-6 py-5 pointer-events-none flex">
          {Q[currentStep]?.type !== 'welcome' && Q[currentStep]?.type !== 'done' && (
            <div className="backdrop-blur-md bg-background/50 px-4 py-1.5 rounded-full border border-border/40 text-xs font-semibold text-muted-foreground">
              {stepText}
            </div>
          )}
        </div>

        {/* Background Animation */}
        <AnimatedBackground />

        {/* Main Content Area */}
        <div className="relative w-full max-w-4xl mx-auto h-[600px] flex-2 z-10">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 px-6 md:px-12 lg:px-20 overflow-y-auto no-scrollbar pb-40"
            >
              {renderSlideContent(Q[currentStep], currentStep)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Navigation Controls */}
        <AnimatePresence>
          {Q[currentStep]?.type !== 'welcome' && Q[currentStep]?.type !== 'done' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed right-6 md:right-10 bottom-8 z-30 flex gap-2">
              <button className="w-12 h-12 rounded-full border border-border/50 bg-card/80 backdrop-blur-md text-foreground shadow-sm flex items-center justify-center transition-all hover:bg-card hover:shadow-md hover:border-border disabled:opacity-30 disabled:cursor-not-allowed" onClick={goBack} disabled={currentStep === 0} aria-label="Previous step">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20 flex items-center justify-center transition-all hover:bg-primary hover:shadow-md hover:shadow-primary/40 disabled:opacity-30 disabled:cursor-not-allowed" onClick={advance} disabled={currentStep >= Q.length - 1} aria-label="Next step">
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile progress text */}
        <div className="fixed left-6 bottom-8 z-30 md:hidden text-xs text-muted-foreground font-semibold backdrop-blur-md bg-background/50 px-3 py-1.5 rounded-full border border-border/40">
          {stepText}
        </div>

      </div>
    </div >
  );
}

