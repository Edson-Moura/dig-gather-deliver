import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

interface FeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const Feedback: React.FC<FeedbackProps> = ({ 
  type, 
  message, 
  className,
  size = 'md',
  showIcon = true
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    loading: Loader2
  };

  const styles = {
    success: 'bg-green/10 text-green border-green/20 dark:bg-green/10 dark:text-green-light dark:border-green/30',
    error: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:border-destructive/30',
    warning: 'bg-orange/10 text-orange border-orange/20 dark:bg-orange/10 dark:text-orange-light dark:border-orange/30',
    info: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/10 dark:text-primary-light dark:border-primary/30',
    loading: 'bg-muted text-muted-foreground border-border'
  };

  const iconStyles = {
    success: 'text-green',
    error: 'text-destructive',
    warning: 'text-orange',
    info: 'text-primary',
    loading: 'text-primary animate-spin'
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border animate-fade-in transition-smooth",
      styles[type],
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <Icon className={cn(
          iconStyles[type],
          iconSizeClasses[size]
        )} />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export { Feedback };