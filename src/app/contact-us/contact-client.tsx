"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Linkedin, Loader2, Mail, Send } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

// -----------------------------
// Contact form schema
// -----------------------------
const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
  subject: z.string({ required_error: "Select a subject." }),
  message: z.string().min(10, "Message must be at least 10 characters.").max(500),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [navOpen, setNavOpen] = useState(false);

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { fullName: "", email: "", phone: "", message: "" },
  });

  const { formState: { isSubmitting }, reset } = contactForm;

  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => { document.body.style.overflow = "auto"; };
  }, [navOpen]);

  const headerProps = {
    activeView: "home" as const,
    setActiveView: () => {},
    isLoggedIn: false,
    onLogout: () => {},
    isLoading: false,
    isStaticPage: true,
    navOpen,
    setNavOpen,
    heroVisible: false,
  };

  async function onContactSubmit(data: ContactFormValues) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: "Message Sent!", description: "We'll get back to you soon." });
        reset();
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.error || "Unknown error occurred.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not connect to server.",
      });
    }
  }

  return (
    <div className="flex flex-col">
      {/* Logo + Home Button */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <div onClick={() => router.push("/")} className="cursor-pointer">
          <Image src="/logo.png" alt="Hustloop Logo" width={120} height={120} />
        </div>
        <Link href="/" passHref>
          <Button variant="outline" size="icon" aria-label="Home">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <Header {...headerProps} />


      <main className="flex-grow container relative z-40 ultrawide-fix m-auto px-4 py-12 md:pt-14 mt-16">
        <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <Card className="p-8 lg:p-12 flex-col justify-center flex">
            <CardHeader className="p-0">
              <CardTitle className="text-4xl font-bold font-headline">
                Ready to build the Future?
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <p className="text-muted-foreground mb-4">
                Join Hustloop today and let’s turn your vision into reality.
              </p>

              <p className="font-semibold text-sm">Email us</p>
              <a href="mailto:support@hustloop.com" className="text-primary hover:underline">
                support@hustloop.com
              </a>

              <div className="flex gap-4 mt-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93ZM17.25 20.72h2.6L6.86 2.6H4.06l13.19 18.12Z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/hustloop/" target="_blank">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:support@hustloop.com">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8 lg:p-12">
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                <FormField
                  control={contactForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={contactForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={contactForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl><Input placeholder="Phone number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subject */}
                <FormField
                  control={contactForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="mentorship">Mentorship Programs</SelectItem>
                          <SelectItem value="incubation">Incubation Support</SelectItem>
                          <SelectItem value="msme">MSME Partnerships</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="tech-transfer">Technology Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={contactForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl><Textarea placeholder="How can we help?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

              </form>
            </Form>
          </Card>

        </section>

        <div className="w-full mt-6">
          <Footer />
        </div>
      </main>
    </div>
  );
}
