
import { Linkedin, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="font-headline text-2xl" style={{ color: '#facc15' }}>
              hustl<strong className="text-3xl align-middle font-bold">∞</strong>p
            </div>
            <Separator orientation="vertical" className="h-6 bg-border" />
            <p className="text-xs text-muted-foreground">
              Smart hustle. <br /> Infinite growth..
            </p>
          </div>
          <div className="text-center order-last sm:order-none">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} hustloop. All rights reserved.
            </p>
            <div className="flex gap-4 justify-center mt-2">
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="X" className="text-muted-foreground hover:text-primary transition-colors">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
                <title>X</title>
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931L18.901 1.153Zm-1.653 19.57h2.608L6.856 2.597H4.062l13.185 18.126Z"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
