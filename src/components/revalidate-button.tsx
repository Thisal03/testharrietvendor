'use client';
import React from 'react';
import { Button } from './ui/button';
import { Check, RefreshCw } from 'lucide-react';
import { invalidatePath } from '@/framework/revalidate';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const RevalidateButton = () => {
  const [loading, setLoading] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const breadcrumbs = useBreadcrumbs();

  const handleRevalidate = () => {
    setLoading(true);
    invalidatePath(breadcrumbs?.[breadcrumbs.length - 1]?.link);

    setTimeout(() => {
      setLoading(false);
      toast.success('Path revalidated!');
      setChecked(true);

      setTimeout(() => {
        setChecked(false);
      }, 2000);
    }, 3000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          onClick={handleRevalidate}
          disabled={loading || checked}
        >
          {checked ? (
            <Check className={cn('size-4')} />
          ) : (
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Revalidate Path</TooltipContent>
    </Tooltip>
  );
};

export default RevalidateButton;
