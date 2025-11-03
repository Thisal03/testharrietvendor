import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function FormCardSkeleton() {
  return (
    <Card className='mx-auto w-full max-w-5xl shadow-sm'>
      {/* Header with gradient */}
      <CardHeader className='border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'>
        <CardTitle className='text-left text-2xl font-bold'>
          <Skeleton className='h-8 w-64' />
        </CardTitle>
        <Skeleton className='h-4 w-96 mt-1' />
      </CardHeader>

      <CardContent className='pt-6'>
        <div className='space-y-8'>
          {/* Section 1: Basic Information */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Skeleton className='h-9 w-9 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-3 w-56' />
              </div>
            </div>

            {/* Product Name */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-10 w-full' />
            </div>

            {/* Two-column grid for descriptions and size chart */}
            <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
              {/* Short Description */}
              <div className='space-y-2'>
                <Skeleton className='h-4 w-36' />
                <Skeleton className='h-32 w-full rounded-lg' />
              </div>

              {/* Size Chart Toggle */}
              <div className='pt-5.5'>
                <div className='p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm h-fit space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-6 w-11 rounded-full' />
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className='lg:col-span-2 space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-48 w-full rounded-lg' />
              </div>
            </div>
          </div>

          {/* Section 2: Product Type */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Skeleton className='h-9 w-9 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-3 w-64' />
              </div>
            </div>

            {/* Product Type Cards */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Skeleton className='h-24 w-full rounded-lg' />
              <Skeleton className='h-24 w-full rounded-lg' />
            </div>
          </div>

          {/* Section 3: Categories & Media */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Skeleton className='h-9 w-9 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-3 w-72' />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              {/* Categories */}
              <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full rounded-lg' />
              </div>

              {/* Images */}
              <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-4'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-64' />
                <Skeleton className='h-32 w-full rounded-lg' />
              </div>
            </div>
          </div>

          {/* Section 4: Pricing */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Skeleton className='h-9 w-9 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-3 w-64' />
              </div>
            </div>

            <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-5'>
              <div className='w-full md:w-1/2 space-y-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-10 w-full' />
              </div>

              {/* Sale toggle */}
              <div className='p-3 rounded-md bg-gray-50 dark:bg-gray-700'>
                <div className='flex items-center justify-between'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-6 w-11 rounded-full' />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Inventory */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Skeleton className='h-9 w-9 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-28' />
                <Skeleton className='h-3 w-72' />
              </div>
            </div>

            <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm space-y-5'>
              <div className='flex items-end gap-3'>
                <div className='w-full md:w-1/6 space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-10 w-full' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-40' />
                  <Skeleton className='h-6 w-11 rounded-full' />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-10 w-full' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-10 w-full' />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-between pt-6 mt-8 border-t'>
            <Skeleton className='h-4 w-32' />
            <div className='flex gap-3'>
              <Skeleton className='h-10 w-28' />
              <Skeleton className='h-10 w-40' />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
