import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IconCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const IconCard = React.forwardRef<HTMLDivElement, IconCardProps>(
  ({ className, icon, title, description, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        'group flex flex-col text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20',
        className
      )}
      {...props}
    >
      <CardContent className="flex flex-grow flex-col items-start gap-6 p-6">
        <div className="flex w-full items-start justify-between">
            <div className="flex-grow space-y-2">
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              {icon}
            </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
);
IconCard.displayName = 'IconCard';

export { IconCard };
