'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

import { Step1Data, step1Schema } from '../../form-schemas';
import { useFormStore } from '../../form-store';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import {
  checkEmailAvailability,
  checkShopUrlAvailability
} from '@/framework/vendor/register-vendor';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

export function Step1PersonalInfo() {
  const { formData, updateFormData, nextStep } = useFormStore();

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData
  });

  const { watch, setValue } = form;

  const agreeToTerms = watch('agreeToTerms');
  const shopName = watch('shopName');
  const shopUrl = watch('shopUrl');
  const email = watch('email');

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [shopUrlError, setShopUrlError] = React.useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const [checkingShopUrl, setCheckingShopUrl] = React.useState(false);

  // Debounced email check
  const debouncedCheckEmail = useDebouncedCallback(async (value: string) => {
    if (!value) return;
    setCheckingEmail(true);
    try {
      const result = await checkEmailAvailability(value);
      setEmailError(result.exists ? 'Email already registered' : null);
    } catch {
      setEmailError('Could not verify email');
    } finally {
      setCheckingEmail(false);
    }
  }, 500);

  // Debounced shop url check
  const debouncedCheckShopUrl = useDebouncedCallback(async (value: string) => {
    if (!value) return;
    setCheckingShopUrl(true);
    try {
      const result = await checkShopUrlAvailability(value);
      setShopUrlError(result.exists ? 'Shop URL already taken' : null);
    } catch {
      setShopUrlError('Could not verify shop URL');
    } finally {
      setCheckingShopUrl(false);
    }
  }, 500);

  // Auto-generate shop URL when shop name changes
  React.useEffect(() => {
    if (shopName) {
      const generatedUrl = shopName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('shopUrl', generatedUrl, { shouldValidate: true });
    }
  }, [shopName, setValue]);

  // Run availability checks
  React.useEffect(() => {
    if (email) debouncedCheckEmail(email);
  }, [email, debouncedCheckEmail]);

  React.useEffect(() => {
    if (shopUrl) debouncedCheckShopUrl(shopUrl);
  }, [shopUrl, debouncedCheckShopUrl]);

  const onSubmit = (data: Step1Data) => {
    if (emailError || shopUrlError) return;
    updateFormData(data);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* First & Last Name */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <motion.div
            custom={0}
            initial='hidden'
            animate='visible'
            variants={fieldVariants}
          >
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='John' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            custom={1}
            initial='hidden'
            animate='visible'
            variants={fieldVariants}
          >
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        {/* Email */}
        <motion.div
          custom={2}
          initial='hidden'
          animate='visible'
          variants={fieldVariants}
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email Address <span className='text-destructive'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='john@example.com'
                    {...field}
                  />
                </FormControl>
                {emailError && (
                  <p className='text-destructive text-sm'>{emailError}</p>
                )}
                {checkingEmail && (
                  <p className='text-muted-foreground text-xs'>
                    Checking email...
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Phone */}
        <motion.div
          custom={3}
          initial='hidden'
          animate='visible'
          variants={fieldVariants}
        >
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone Number <span className='text-destructive'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    placeholder='+94 (77) 456-7890'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Password */}
        <motion.div
          custom={4}
          initial='hidden'
          animate='visible'
          variants={fieldVariants}
        >
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password <span className='text-destructive'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='password' placeholder='••••••••' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Shop Info */}
        <motion.div
          custom={5}
          initial='hidden'
          animate='visible'
          variants={fieldVariants}
          className='space-y-4 border-t pt-6'
        >
          <h3 className='text-lg font-semibold'>Shop Information</h3>

          {/* Shop Name */}
          <FormField
            control={form.control}
            name='shopName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Shop Name <span className='text-destructive'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='My Awesome Shop' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shop URL */}
          <FormField
            control={form.control}
            name='shopUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Shop URL <span className='text-destructive'>*</span>
                </FormLabel>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-sm whitespace-nowrap'>
                    harrietshopping.com/store/
                  </span>
                  <FormControl>
                    <Input placeholder='my-shop' {...field} />
                  </FormControl>
                </div>
                {shopUrlError && (
                  <p className='text-destructive text-sm'>{shopUrlError}</p>
                )}
                {checkingShopUrl && (
                  <p className='text-muted-foreground text-xs'>
                    Checking shop URL...
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Terms */}
        <motion.div
          custom={6}
          initial='hidden'
          animate='visible'
          variants={fieldVariants}
        >
          <FormField
            control={form.control}
            name='agreeToTerms'
            render={({ field }) => (
              <FormItem className='flex items-center space-x-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>
                <FormLabel className='cursor-pointer text-sm leading-relaxed font-normal'>
                  I have read and agree to the Terms & Conditions.
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Next Step */}
        <motion.div
          custom={7}
          initial='hidden'
          animate='visible'
          variants={fieldVariants}
          className='flex justify-end pt-4'
        >
          <Button type='submit'>
            Next Step
            <ArrowRight />
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
