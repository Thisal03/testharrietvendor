/**
 * Zustand store for product form state management
 * Replaces 12+ useState hooks and forceUpdate anti-pattern
 * 
 * @returns Zustand store with product form state and setters
 * 
 * @remarks
 * This store centralizes all product form state to eliminate the anti-patterns
 * of excessive useState hooks and forceUpdate calls. It uses proper Zustand
 * selectors for optimal re-render performance.
 * 
 * Store includes:
 * - Vendor and category selection state
 * - Attribute expansion/collapse state
 * - Variation data and expansion state
 * - Form submission state
 * - SKU validation state
 * - Progress modal state and animations
 * 
 * @example
 * ```tsx
 * const store = useProductFormStore();
 * const { variations, setVariations, isSubmitting } = store;
 * 
 * // Update variations
 * setVariations(newVariations);
 * 
 * // Reset all state
 * store.reset();
 * ```
 */

import { create } from 'zustand';
import { Variation } from '../types';

interface ProductFormStore {
  // Vendor & Category State
  vendorId: number | undefined;
  setVendorId: (id: number | undefined) => void;
  
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  
  // Attribute State
  expandedAttributes: Set<string>;
  setExpandedAttributes: (set: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  
  // Variation State
  variations: Variation[];
  setVariations: (variations: Variation[] | ((prev: Variation[]) => Variation[])) => void;
  
  expandedVariations: Set<string>;
  setExpandedVariations: (set: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  
  // Form State
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  
  isSKUValid: boolean;
  setIsSKUValid: (value: boolean) => void;
  
  productStatus: 'draft' | 'pending' | 'publish';
  setProductStatus: (status: 'draft' | 'pending' | 'publish') => void;
  
  // Progress Modal State
  showProgress: boolean;
  setShowProgress: (value: boolean) => void;
  
  progress: number;
  setProgress: (value: number | ((prev: number) => number)) => void;
  
  progressStatus: 'idle' | 'uploading' | 'creating' | 'success' | 'error';
  setProgressStatus: (status: 'idle' | 'uploading' | 'creating' | 'success' | 'error') => void;
  
  progressMessage: string;
  setProgressMessage: (message: string) => void;
  
  // Reset all state
  reset: () => void;
}

const initialState = {
  vendorId: undefined as number | undefined,
  selectedCategories: [] as number[],
  expandedAttributes: new Set<string>(),
  variations: [] as Variation[],
  expandedVariations: new Set<string>(),
  isSubmitting: false,
  isSKUValid: true,
  productStatus: 'pending' as 'draft' | 'pending' | 'publish',
  showProgress: false,
  progress: 0,
  progressStatus: 'idle' as const,
  progressMessage: ''
};

export const useProductFormStore = create<ProductFormStore>((set) => ({
  ...initialState,
  
  setVendorId: (id) => set({ vendorId: id }),
  
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  
  setExpandedAttributes: (setter) => set((state) => ({
    expandedAttributes: typeof setter === 'function' ? setter(state.expandedAttributes) : setter
  })),
  
  setVariations: (setter) => set((state) => ({
    variations: typeof setter === 'function' ? setter(state.variations) : setter
  })),
  
  setExpandedVariations: (setter) => set((state) => ({
    expandedVariations: typeof setter === 'function' ? setter(state.expandedVariations) : setter
  })),
  
  setIsSubmitting: (value) => set({ isSubmitting: value }),
  
  setIsSKUValid: (value) => set({ isSKUValid: value }),
  
  setProductStatus: (status) => set({ productStatus: status }),
  
  setShowProgress: (value) => set({ showProgress: value }),
  
  setProgress: (setter) => set((state) => ({
    progress: typeof setter === 'function' ? setter(state.progress) : setter
  })),
  
  setProgressStatus: (status) => set({ progressStatus: status }),
  
  setProgressMessage: (message) => set({ progressMessage: message }),
  
  reset: () => set(initialState)
}));

