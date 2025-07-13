import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-4 text-2xl font-headline text-primary mb-6" style={{ color: '#facc15' }}>
        <Image src="/logo.png" alt="Hustloop Logo" width={50} height={50} className="h-12 w-12 animate-pulse" />
        <span>
          hustl<strong className="text-3xl align-middle font-bold">∞</strong>p
        </span>
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Initializing...</p>
    </div>
  );
};

export default PageLoader;
