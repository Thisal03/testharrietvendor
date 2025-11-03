import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';

export default function OrderDetailsSkeleton() {
  return (
    <div className='min-h-screen'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            {/* Back Button */}
            <Skeleton className='h-10 w-10' />
            <div className='space-y-2'>
              {/* Order Number */}
              <Skeleton className='h-6 w-32' />
              {/* Date */}
              <Skeleton className='h-4 w-40' />
            </div>
          </div>
          <div className='flex items-center gap-2 lg:w-96'>
            {/* Action Button */}
            <Skeleton className='h-9 w-32' />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          {/* Main Content */}
          <div className='space-y-8 lg:col-span-8'>
            {/* Order Items Card */}
            <Card className='shadow-sm'>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-5' />
                  <CardTitle>
                    <Skeleton className='h-6 w-32' />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className='rounded-lg border'>
                  {/* Table Header */}
                  <div className='bg-muted/50 border-b'>
                    <div className='grid grid-cols-3 gap-4 p-4'>
                      <Skeleton className='h-4 w-20' />
                      <Skeleton className='h-4 w-20 mx-auto' />
                      <Skeleton className='h-4 w-16 ml-auto' />
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-4 ${i % 2 === 0 ? 'bg-muted/20' : 'bg-muted/40'}`}>
                      <div className='grid grid-cols-3 gap-4 items-center'>
                        {/* Product with image */}
                        <div className='flex items-center gap-2'>
                          <Skeleton className='h-12 w-12 rounded-sm' />
                          <Skeleton className='h-4 w-32' />
                        </div>
                        {/* Quantity */}
                        <div className='flex justify-center'>
                          <Skeleton className='h-6 w-8 rounded-full' />
                        </div>
                        {/* Price */}
                        <div className='flex justify-end'>
                          <Skeleton className='h-5 w-20' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information - Two Column Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Billing Address Card */}
              <Card className='shadow-sm'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5' />
                    <CardTitle>
                      <Skeleton className='h-6 w-32' />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                  <div className='flex items-start gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <div className='space-y-2 flex-1'>
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-3/4' />
                      <Skeleton className='h-3 w-2/3' />
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-40' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address Card */}
              <Card className='shadow-sm'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5' />
                    <CardTitle>
                      <Skeleton className='h-6 w-36' />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                  <div className='flex items-start gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <div className='space-y-2 flex-1'>
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-3/4' />
                      <Skeleton className='h-3 w-2/3' />
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information Card */}
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>
                  <Skeleton className='h-6 w-48' />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <div className='bg-muted/50 rounded-lg p-3'>
                    <Skeleton className='h-3 w-full' />
                    <Skeleton className='h-3 w-4/5 mt-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6 lg:col-span-4'>
            {/* Order Summary Card */}
            <Card className='sticky shadow-sm'>
              <CardHeader>
                <CardTitle>
                  <Skeleton className='h-6 w-32' />
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Status */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-28' />
                    <Skeleton className='h-6 w-24 rounded-full' />
                  </div>
                  <Skeleton className='h-10 w-full' />
                </div>

                <Separator />

                {/* Dates */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-5 w-40' />
                </div>

                <Separator />

                {/* Totals */}
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                  
                  <Separator />
                  
                  <div className='flex justify-between items-center pt-2'>
                    <Skeleton className='h-5 w-20' />
                    <Skeleton className='h-6 w-28' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

