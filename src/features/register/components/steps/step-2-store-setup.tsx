'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft } from 'lucide-react';

import { Step2Data, step2Schema } from '../../form-schemas';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

const countries = ['Sri Lanka'];

const categories = ['Uncategorized'];

export function Step2StoreSetup() {
  const { formData, updateFormData, nextStep, prevStep } = useFormStore();

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
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
        {/* Store Address */}
        <div>
          <h3 className='mb-4 text-lg font-semibold'>Store Address</h3>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='street'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>
                    Street <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='123 Main Street' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='street2'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Street 2</FormLabel>
                  <FormControl>
                    <Input placeholder='Apartment, suite, etc.' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>
                      City <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='New York' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='zipCode'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>
                      Post/Zip Code <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='10001' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>
                      Country <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a country' />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>
                      State/Province <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Western' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Store Category */}
        <div className='border-t pt-6'>
          <h3 className='mb-4 text-lg font-semibold'>Store Category</h3>
          <FormField
            control={form.control}
            name='storeCategory'
            render={({ field }) => (
              <FormItem className='space-y-2'>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Navigation Buttons */}
        <div className='flex justify-between pt-4'>
          <Button type='button' variant='outline' onClick={prevStep}>
            <ArrowLeft /> Previous
          </Button>
          <Button type='submit'>
            Next Step <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
  );
}
