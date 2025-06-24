
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Send, Linkedin, Twitter, Github, Facebook, Instagram } from "lucide-react";

interface ContactViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ContactView({ isOpen, onOpenChange }: ContactViewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
        <ScrollArea className="h-full">
            <div className="p-8 md:p-12">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 font-headline" style={{ color: '#D4AF37' }}>
                    WHERE VISION MEETS OPPORTUNITY
                </h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left side: Contact Info */}
                    <div className="space-y-8 flex flex-col">
                        <div>
                            <h2 className="text-3xl font-bold font-headline mb-4">Get in Touch</h2>
                            <p className="text-muted-foreground">
                                Have questions about our services? We're here to help! Fill out the form and we'll get back to you as soon as possible.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold">Visit Us</h3>
                                    <p className="text-muted-foreground">
                                        45 Five Roads<br/>
                                        Salem, Tamil Nadu 636005
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold">Call Us</h3>
                                    <p className="text-muted-foreground">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Mail className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold">Email Us</h3>
                                    <p className="text-muted-foreground">contact@planformoney.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-auto pt-8">
                            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted rounded-full">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted rounded-full">
                                <Twitter className="h-5 w-5" />
                            </a>
                             <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted rounded-full">
                                <Facebook className="h-5 w-5" />
                            </a>
                             <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted rounded-full">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted rounded-full">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Right side: Contact Form */}
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-lg">
                        <form className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input id="full-name" placeholder="Enter your full name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="Enter your email address" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="Enter your phone number" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select>
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General Inquiry</SelectItem>
                                        <SelectItem value="mentorship">Mentorship Programs</SelectItem>
                                        <SelectItem value="incubation">Incubation Support</SelectItem>
                                        <SelectItem value="msme">MSME Partnerships</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="How can we help you?" rows={4} />
                            </div>
                            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Send className="mr-2 h-4 w-4" /> Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
