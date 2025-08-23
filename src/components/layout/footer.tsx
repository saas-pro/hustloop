
import { Linkedin, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import NewsletterForm from "./newsletter-form";
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t" id="newsletter-section">
      <div className="container mx-auto py-12 px-4 space-y-12">
        <NewsletterForm />
        <Separator />
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          {/* Left: Logo and Tagline */}
          <div className="flex-1 flex justify-center md:justify-start">
            <div className="flex items-center gap-3 text-center md:text-left">
              <Image
                src="/logo.png"
                alt="Hustloop logo"
                width={120}
                height={48}
                className="h-12 w-auto min-w-[120px] max-w-[200px] object-contain"
              />
              <Separator orientation="vertical" className="h-8 bg-border hidden md:block" />
              <p className="text-muted-foreground hidden md:block">
                Smart hustle. <br /> Infinite growth..
              </p>
            </div>
          </div>

          {/* Center: Copyright and Legal */}
          <div className="text-center text-muted-foreground order-last md:order-none">
            <p>&copy; {new Date().getFullYear()} hustloop. All rights reserved.</p>
            <div className="flex gap-4 justify-center mt-1">
              <a href="/terms-of-service" className="text-xs hover:text-primary transition-colors">Terms of Service</a>
              <a href="/privacy-policy" className="text-xs hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>
          
          {/* Right: Social Icons */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="flex items-center gap-4">
              <a href="#" aria-label="X" className="text-muted-foreground hover:text-primary transition-colors">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
                  <title>X</title>
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931L18.901 1.153Zm-1.653 19.57h2.608L6.856 2.597H4.062l13.185 18.126Z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/hustloop/" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:support@hustloop.com" aria-label="Email" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
