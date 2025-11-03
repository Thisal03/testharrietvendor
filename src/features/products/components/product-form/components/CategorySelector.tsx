'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormLabel } from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/framework/products/get-categories';
import { UseFormReturn } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { FormValues } from '../schema';

interface CategorySelectorProps {
  form: UseFormReturn<FormValues>;
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  dynamicCategories?: ProductCategory[];
  isLoading?: boolean;
}

/**
 * Component for selecting product categories
 * 
 * Provides a searchable combobox interface for selecting multiple product categories
 * from WooCommerce. Displays selected categories as removable badges.
 * 
 * @param props - Component props
 * @param props.form - React Hook Form instance
 * @param props.selectedCategories - Array of selected category IDs
 * @param props.setSelectedCategories - Function to update selected categories
 * @param props.dynamicCategories - Available categories from WooCommerce
 * @param props.isLoading - Loading state for categories
 * @returns JSX element with category selector UI
 */
export function CategorySelector({
  form,
  selectedCategories,
  setSelectedCategories,
  dynamicCategories,
  isLoading = false
}: CategorySelectorProps) {
  const [categoryOpen, setCategoryOpen] = React.useState(false);

  // Use categories from WooCommerce backend
  const categoriesToUse = dynamicCategories || [];

  return (
    <div className='space-y-4'>
      <FormLabel>Categories</FormLabel>
      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={categoryOpen}
            className='w-full justify-between'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Loading categories...
              </>
            ) : selectedCategories.length > 0 ? (
              `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`
            ) : (
              'Select categories...'
            )}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <Command>
            <CommandInput placeholder='Search categories...' />
            <CommandList>
              {isLoading ? (
                <div className='p-2 space-y-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='flex items-center gap-2 px-2 py-1.5'>
                      <Skeleton className='h-4 w-4 rounded-sm' />
                      <Skeleton className='h-4 flex-1' />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {categoriesToUse.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <CommandItem
                          key={category.id}
                          onSelect={() => {
                            const newCategories = isSelected
                              ? selectedCategories.filter((id) => id !== category.id)
                              : [...selectedCategories, category.id];
                            setSelectedCategories(newCategories);
                            const formattedCategories = newCategories.map((id) => ({ id }));
                            form.setValue('categories', formattedCategories);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {selectedCategories.map((categoryId) => {
            const category = categoriesToUse.find((c) => c.id === categoryId);
            if (!category) return null;
            return (
              <Badge
                key={category.id}
                variant='secondary'
                className='flex items-center gap-1'
              >
                {category.name}
                <button
                  type='button'
                  className='ml-1 hover:text-destructive transition-colors focus:outline-none cursor-pointer'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newCategories = selectedCategories.filter(
                      (id) => id !== category.id
                    );
                    setSelectedCategories(newCategories);
                    form.setValue(
                      'categories',
                      newCategories.map((id) => ({ id }))
                    );
                  }}
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

