'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormStore } from '../../form-store';
import { registerVendor } from '@/framework/vendor/register-vendor';
import Link from 'next/link';

export default function Step4Success() {
  const {
    formData,
    resetForm,
    response,
    prevStep,
    setResponse,
    isSubmitting,
    setIsSubmitting
  } = useFormStore();
  const [error, setError] = useState<string | null>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    const submitForm = async () => {
      if (response || isSubmitting) return;
      if (hasSubmitted.current) return;
      hasSubmitted.current = true;

      setIsSubmitting(true);
      setError(null);

      try {
        const res = await registerVendor(formData);
        setResponse(res);
      } catch (err) {
        console.error('Error registering vendor:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    submitForm();
  }, [formData, isSubmitting, response, setIsSubmitting, setResponse]);

  const handleRetry = () => {
    setResponse(null);
    setError(null);
    // Re-trigger submission by resetting response
    window.location.reload();
  };

  const handleGoBack = () => {
    setResponse(null);
    setError(null);
    prevStep();
  };

  // Loading state
  if (isSubmitting || (!response && !error)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='space-y-6 py-12 text-center'
      >
        <div className='flex justify-center'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear'
            }}
            className='bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full'
          >
            <Loader2 className='text-primary h-10 w-10' />
          </motion.div>
        </div>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>Processing Your Registration</h2>
          <p className='text-muted-foreground mx-auto max-w-md'>
            Please wait while we submit your vendor application...
          </p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error || (response && response.status !== 200)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='space-y-6 py-12 text-center'
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className='flex justify-center'
        >
          <div className='bg-destructive/10 flex h-20 w-20 items-center justify-center rounded-full'>
            <XCircle className='text-destructive h-10 w-10' />
          </div>
        </motion.div>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>Registration Failed</h2>
          <p className='text-muted-foreground mx-auto max-w-md'>
            {error ||
              response?.data?.message ||
              'There was an issue with your registration. Please try again.'}
          </p>
        </div>
        <Alert variant='destructive' className='mx-auto max-w-md'>
          <AlertDescription>
            If the problem persists, please contact our support team for
            assistance.
          </AlertDescription>
        </Alert>
        <div className='flex justify-center gap-4'>
          <Button
            onClick={handleGoBack}
            variant='outline'
            className='gap-2 bg-transparent'
          >
            <ArrowLeft className='h-4 w-4' />
            Go Back
          </Button>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </motion.div>
    );
  }

  // Success state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='space-y-6 py-12 text-center'
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className='flex justify-center'
      >
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-green-600/10'>
          <CheckCircle2 className='h-10 w-10 text-green-600' />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='space-y-2'
      >
        <h2 className='text-2xl font-bold'>Registration Complete!</h2>
        <p className='text-muted-foreground mx-auto max-w-md'>
          Thank you for registering as a vendor. Please contact admin to enable
          your account for selling.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='flex justify-center gap-4'
      >
        <Button onClick={resetForm} variant='outline'>
          Submit Another Application
        </Button>
        <Link href='/'>
          <Button onClick={resetForm}>Go to Home</Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
