'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className='w-full'>
      <div className='grid grid-cols-3 place-items-center gap-4 bg-white/50'>
        {steps.map((step) => (
          <div key={step.number} className='flex flex-1 flex-col items-center'>
            <motion.div
              initial={false}
              animate={{
                scale: currentStep === step.number ? 1.1 : 1
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                currentStep > step.number
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.number
                    ? 'bg-accent text-accent-foreground ring-accent/20 ring-4'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {currentStep > step.number ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className='h-5 w-5' />
                </motion.div>
              ) : (
                step.number
              )}
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                opacity: currentStep >= step.number ? 1 : 0.5
              }}
              className='mt-2 hidden text-center sm:block'
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  currentStep >= step.number
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                {step.description}
              </p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
