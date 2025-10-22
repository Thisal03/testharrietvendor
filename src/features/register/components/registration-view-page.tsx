'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../form-store';
import { StepIndicator } from './step-indicator';
import { Step1PersonalInfo } from './steps/step-1-personal-info';
import { Step2StoreSetup } from './steps/step-2-store-setup';
import { Step3PaymentSetup } from './steps/step-3-payment-setup';
import AuthBanner from '@/components/auth-banner';
import HarrietLogo from '@/components/harriet-logo';
import Step4Success from './steps/step-4-success';

const steps = [
  { number: 1, title: 'Personal Info', description: 'Your basic information' },
  { number: 2, title: 'Store Setup', description: 'Configure your store' },
  { number: 3, title: 'Payment', description: 'Bank account details' }
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

export function RegistrationViewPage() {
  const currentStep = useFormStore((state) => state.currentStep);
  const previousStep = useFormStore((state) => state.previousStep);

  const direction = currentStep > (previousStep || 0) ? 1 : -1;

  return (
    <div className='relative h-screen flex-col items-center justify-center lg:grid lg:grid-cols-2 lg:px-0'>
      <AuthBanner />
      <div className='flex h-full flex-col items-center overflow-y-scroll p-4 py-8 lg:px-8'>
        <HarrietLogo className='relative z-20 mb-8 flex items-center lg:hidden' />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-2xl'
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-center lg:hidden'
          >
            <div className='text-center'>
              <h1 className='mb-2 text-xl font-semibold tracking-tight md:text-2xl'>
                Vendor Registration
              </h1>
              <p className='text-muted-foreground text-sm'>
                Complete the steps below to set up your vendor account and start
                selling.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className='my-6 mb-10'
          >
            <StepIndicator steps={steps} currentStep={currentStep} />
          </motion.div>
          <AnimatePresence mode='wait' custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {currentStep === 1 && <Step1PersonalInfo />}
              {currentStep === 2 && <Step2StoreSetup />}
              {currentStep === 3 && <Step3PaymentSetup />}
              {currentStep === 4 && <Step4Success />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
