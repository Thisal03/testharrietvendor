/**
 * Variable Product Form Wrapper
 * Wraps VariableProductSettings with dynamic import for code splitting
 */

'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { UseFormReturn } from 'react-hook-form';
import { ProductCategory } from '@/framework/products/get-categories';
import { Variation } from '../types';
import { FormValues } from '../schema';

const VariableProductSettings = dynamic(
  () => import('./VariableProductSettings').then(mod => ({ default: mod.VariableProductSettings })),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" /> }
);

interface VariableProductFormProps {
  form: UseFormReturn<FormValues>;
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  dynamicCategories?: ProductCategory[];
  isCategoriesLoading?: boolean;
  expandedAttributes: Set<string>;
  onToggleAttributeExpansion: (attributeName: string) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onAddOption: (attributeIndex: number) => void;
  onRemoveOption: (attributeIndex: number, optionIndex: number) => void;
  variations: Variation[];
  expandedVariations: Set<string>;
  onToggleVariationExpansion: (variationId: string) => void;
  onUpdateVariation: (index: number, field: string | Record<string, any>, value?: any) => void;
  onGenerateVariations: () => void;
  vendorId?: number;
  productId?: number;
}

export function VariableProductForm(props: VariableProductFormProps) {
  return <VariableProductSettings {...props} />;
}

