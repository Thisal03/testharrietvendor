'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';

import { Step3Data, step3Schema } from '../../form-schemas';
import { useFormStore } from '../../form-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

export function Step3PaymentSetup() {
  const { formData, updateFormData, prevStep, nextStep } = useFormStore();

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          updateFormData(data);
          nextStep();
        })}
        className='space-y-6'
      >
        <h3 className='mb-4 text-lg font-semibold'>
          Bank Transfer Information (Optional)
        </h3>

        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='accountHolder'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel>Account Holder</FormLabel>
                <FormControl>
                  <Input placeholder='John Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='accountType'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel>Account Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Please Select...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Personal'>Personal</SelectItem>
                      <SelectItem value='Business'>Business</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='accountNumber'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder='000123456789' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='routingNumber'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Routing Number</FormLabel>
                  <FormControl>
                    <Input placeholder='110000000' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='bankName'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder='Chase Bank' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bankAddress'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel>Bank Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder='123 Bank Street, New York, NY 10001'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='bankIban'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Bank IBAN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='GB82 WEST 1234 5698 7654 32'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bankSwiftCode'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Bank Swift Code</FormLabel>
                  <FormControl>
                    <Input placeholder='CHASUS33' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ownership Checkbox */}
        <FormField
          control={form.control}
          name='attestOwnership'
          render={({ field }) => (
            <FormItem className='flex flex-col space-y-2'>
              <div className='flex items-start space-x-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>
                <FormLabel className='cursor-pointer text-sm leading-relaxed font-normal'>
                  I attest that I am the owner and have full authorization to
                  this bank account
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='text-sm'>
            Please double-check your account information! Incorrect or
            mismatched account name and number can result in withdrawal delays
            and fees.
          </AlertDescription>
        </Alert>

        {/* Navigation Buttons */}
        <div className='flex justify-between pt-4'>
          <Button type='button' variant='outline' onClick={prevStep}>
            <ArrowLeft /> Previous
          </Button>
          <Button type='submit'>Complete Registration</Button>
        </div>
      </form>
    </Form>
  );
}
