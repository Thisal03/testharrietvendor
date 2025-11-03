/**
 * Simple Product Form Wrapper
 * Wraps SimpleProductSettings with dynamic import for code splitting
 */

'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { UseFormReturn } from 'react-hook-form';
import { ProductCategory } from '@/framework/products/get-categories';
import { FormValues } from '../schema';

const SimpleProductSettings = dynamic(
  () => import('./SimpleProductSettings').then(mod => ({ default: mod.SimpleProductSettings })),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" /> }
);

interface SimpleProductFormProps {
  form: UseFormReturn<FormValues>;
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  dynamicCategories?: ProductCategory[];
  isCategoriesLoading?: boolean;
  vendorId?: number;
  productId?: number;
}

export function SimpleProductForm(props: SimpleProductFormProps) {
  return <SimpleProductSettings {...props} />;
}

