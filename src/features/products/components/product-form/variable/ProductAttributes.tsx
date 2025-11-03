'use client';

import * as React from 'react';
import { FloatingLabelInput as Input } from '@/components/ui/floating-input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Plus, Trash, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_ATTRIBUTE_OPTIONS, MAX_PRODUCT_ATTRIBUTES } from '../utils/constants';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../schema';

interface ProductAttributesProps {
  form: UseFormReturn<FormValues>;
  expandedAttributes: Set<string>;
  onToggleAttributeExpansion: (attributeName: string) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onAddOption: (attributeIndex: number) => void;
  onRemoveOption: (attributeIndex: number, optionIndex: number) => void;
  onGenerateVariations?: () => void;
}

/**
 * Component for managing product attributes in variable products
 * 
 * Provides UI for creating, editing, and managing product attributes including
 * Size and Color default attributes, plus custom attributes.
 * Auto-generates variations when attributes are modified.
 * 
 * @param props - Component props
 * @param props.form - React Hook Form instance
 * @param props.expandedAttributes - Set of expanded attribute names
 * @param props.onToggleAttributeExpansion - Callback to toggle attribute expansion
 * @param props.onAddAttribute - Callback to add a new custom attribute
 * @param props.onRemoveAttribute - Callback to remove an attribute
 * @param props.onAddOption - Callback to add an option to an attribute
 * @param props.onRemoveOption - Callback to remove an option from an attribute
 * @param props.onGenerateVariations - Callback to trigger variation generation
 * @returns JSX element with attribute management UI
 */
export function ProductAttributes({
  form,
  expandedAttributes,
  onToggleAttributeExpansion,
  onAddAttribute,
  onRemoveAttribute,
  onAddOption,
  onRemoveOption,
  onGenerateVariations
}: ProductAttributesProps) {
  // Watch attributes to trigger re-renders when they change
  const attributes = form.watch('attributes') || [];
  const totalAttributes = attributes.length;
  const canAddMoreAttributes = totalAttributes < MAX_PRODUCT_ATTRIBUTES;

  // Check if default attributes are selected
  const sizeAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size');
  const colorAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color');
  const isSizeSelected = sizeAttr && sizeAttr.options && sizeAttr.options.length > 0;
  const isColorSelected = colorAttr && colorAttr.options && colorAttr.options.length > 0;

  // Determine if default attributes should be disabled
  const isSizeDisabled = !isSizeSelected && totalAttributes >= MAX_PRODUCT_ATTRIBUTES;
  const isColorDisabled = !isColorSelected && totalAttributes >= MAX_PRODUCT_ATTRIBUTES;

  return (
    <TooltipProvider>
      <div className='space-y-4'>
        {/* Default Attributes - Horizontal Layout */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 items-start'>
        {/* Size Attribute */}
        <SizeAttribute
          form={form}
          isExpanded={expandedAttributes.has('size')}
          onToggle={() => onToggleAttributeExpansion('size')}
          onGenerateVariations={onGenerateVariations}
          isDisabled={isSizeDisabled}
        />

        {/* Color Attribute */}
        <ColorAttribute
          form={form}
          isExpanded={expandedAttributes.has('color')}
          onToggle={() => onToggleAttributeExpansion('color')}
          onGenerateVariations={onGenerateVariations}
          isDisabled={isColorDisabled}
        />
      </div>

      {/* Custom Attributes */}
      <CustomAttributes
        form={form}
        onRemoveAttribute={onRemoveAttribute}
        onRemoveOption={onRemoveOption}
        onGenerateVariations={onGenerateVariations}
      />

      {/* Add Custom Attribute Button - Only show if less than 3 attributes */}
      {canAddMoreAttributes && (
        <Button 
          type='button' 
          variant='outline' 
          onClick={onAddAttribute}
          className='shadow-sm hover:shadow-md transition-shadow'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Custom Attribute
        </Button>
      )}

      {/* Show message when limit is reached */}
      {!canAddMoreAttributes && (
        <div className='text-sm text-muted-foreground text-center py-2'>
          Maximum of {MAX_PRODUCT_ATTRIBUTES} attributes allowed. Remove an attribute to add a new one.
        </div>
      )}

      {/* Helpful message about reserved names */}
      {canAddMoreAttributes && (
        <div className='text-xs text-muted-foreground text-center py-1'>
          Note: &quot;Size&quot; and &quot;Color&quot; are reserved names. Use the default attributes above instead.
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}

// Size Attribute Component
function SizeAttribute({
  form,
  isExpanded,
  onToggle,
  onGenerateVariations,
  isDisabled = false
}: {
  form: UseFormReturn<FormValues>;
  isExpanded: boolean;
  onToggle: () => void;
  onGenerateVariations?: () => void;
  isDisabled?: boolean;
}) {
  // Watch attributes to trigger re-renders
  const attributes = form.watch('attributes') || [];
  
  return (
    <div className={`rounded-lg border bg-white dark:bg-gray-800 overflow-hidden h-fit shadow-sm transition-shadow ${
      isDisabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:shadow-md'
    }`}>
      <Collapsible open={isExpanded && !isDisabled} onOpenChange={isDisabled ? () => {} : onToggle}>
        <CollapsibleTrigger 
          className={`w-full p-4 flex items-center justify-between transition-colors ${
            isDisabled 
              ? 'cursor-not-allowed' 
              : 'hover:bg-gray-50'
          }`}
          disabled={isDisabled}
        >
          <div>
            <h5 className='font-medium mb-1'>Size</h5>
            <p className='text-sm text-gray-500'>
              {(() => {
                const sizeAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size');
                const selectedCount = sizeAttr?.options?.length || 0;
                return selectedCount > 0
                  ? `${selectedCount} size${selectedCount === 1 ? '' : 's'} selected`
                  : 'Click to add sizes';
              })()}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className='p-4 pt-0'>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6'>
            {DEFAULT_ATTRIBUTE_OPTIONS.size.map((option) => {
              const sizeAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size');
              const isSelected = sizeAttr?.options?.includes(option.value) || false;

              return (
                <div
                  key={option.value}
                  className={cn(
                    'relative flex items-center justify-center p-1 border-2 rounded-md cursor-pointer transition-all',
                    isSelected
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => {
                    if (isDisabled) return;
                    const updatedAttributes = [...attributes]; // Create new array
                    let sizeAttrIndex = updatedAttributes.findIndex(
                      (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size'
                    );

                    if (sizeAttrIndex === -1) {
                      updatedAttributes.push({
                        name: 'Size',
                        position: updatedAttributes.length,
                        visible: true,
                        variation: true,
                        options: [option.value]
                      });
                    } else {
                      const currentOptions = updatedAttributes[sizeAttrIndex].options || [];
                      if (currentOptions.includes(option.value)) {
                        updatedAttributes[sizeAttrIndex] = {
                          ...updatedAttributes[sizeAttrIndex],
                          options: currentOptions.filter((opt: string) => opt !== option.value)
                        };
                        if (updatedAttributes[sizeAttrIndex].options.length === 0) {
                          updatedAttributes.splice(sizeAttrIndex, 1);
                        }
                      } else {
                        updatedAttributes[sizeAttrIndex] = {
                          ...updatedAttributes[sizeAttrIndex],
                          options: [...currentOptions, option.value]
                        };
                      }
                    }
                    form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                    // Auto-generation via watch subscription in useVariationHandlers
                  }}
                >
                  {/* {isSelected && (
                    <Check className='absolute top-1 right-1 h-4 w-4 text-primary' />
                  )} */}
                  <span className='font-medium'>{option.label}</span>
                </div>
              );
            })}
          </div>

          {/* Selected Sizes Display */}
          {(() => {
            const sizeAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size');
            const selectedSizes = sizeAttr?.options || [];
            
            if (selectedSizes.length > 0) {
              return (
                <div className='mt-4 pt-4 border-t'>
                  <label className='mb-2 block text-sm font-medium'>Selected Sizes:</label>
                  <div className='flex flex-wrap gap-2'>
                    {selectedSizes.map((size: string) => (
                      <div key={size} className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md border'>
                        <span className='text-sm font-medium'>{size}</span>
                        <span className='w-0.75'></span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900'
                          onClick={() => {
                            const updatedAttributes = [...attributes]; // Create new array
                            const sizeAttrIndex = updatedAttributes.findIndex(
                              (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size'
                            );
                            if (sizeAttrIndex !== -1) {
                              updatedAttributes[sizeAttrIndex] = {
                                ...updatedAttributes[sizeAttrIndex],
                                options: updatedAttributes[sizeAttrIndex].options.filter((opt: string) => opt !== size)
                              };
                              if (updatedAttributes[sizeAttrIndex].options.length === 0) {
                                updatedAttributes.splice(sizeAttrIndex, 1);
                              }
                              form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                              // Auto-generation via watch subscription in useVariationHandlers
                            }
                          }}
                        >
                          <Trash className='h-6 w-6 text-red-600' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Custom Size Input */}
          <div className='mt-4 pt-4 border-t'>
            <label className='mb-2 block text-sm font-medium'>Add Custom Size</label>
            <div className='flex items-center space-x-2'>
              <Input
                id='custom-size-input'
                placeholder='Enter custom size (e.g., 4XL, XXS)'
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (isDisabled) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input && input.value.trim()) {
                      const updatedAttributes = [...attributes]; // Create new array
                      let sizeAttrIndex = updatedAttributes.findIndex(
                        (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size'
                      );

                      if (sizeAttrIndex === -1) {
                        updatedAttributes.push({
                          name: 'Size',
                          position: updatedAttributes.length,
                          visible: true,
                          variation: true,
                          options: [input.value.trim()]
                        });
                      } else {
                        const currentOptions = updatedAttributes[sizeAttrIndex].options || [];
                        if (!currentOptions.includes(input.value.trim())) {
                          updatedAttributes[sizeAttrIndex] = {
                            ...updatedAttributes[sizeAttrIndex],
                            options: [...currentOptions, input.value.trim()]
                          };
                        }
                      }
                      form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                      // Auto-generation via watch subscription in useVariationHandlers
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  const input = document.getElementById('custom-size-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const updatedAttributes = [...attributes]; // Create new array
                    let sizeAttrIndex = updatedAttributes.findIndex(
                      (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'size'
                    );

                    if (sizeAttrIndex === -1) {
                      updatedAttributes.push({
                        name: 'Size',
                        position: updatedAttributes.length,
                        visible: true,
                        variation: true,
                        options: [input.value.trim()]
                      });
                    } else {
                      const currentOptions = updatedAttributes[sizeAttrIndex].options || [];
                      if (!currentOptions.includes(input.value.trim())) {
                        updatedAttributes[sizeAttrIndex] = {
                          ...updatedAttributes[sizeAttrIndex],
                          options: [...currentOptions, input.value.trim()]
                        };
                      }
                    }
                    form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                    // Auto-generation via watch subscription in useVariationHandlers
                    input.value = '';
                  }
                }}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Color Attribute Component
function ColorAttribute({
  form,
  isExpanded,
  onToggle,
  onGenerateVariations,
  isDisabled = false
}: {
  form: UseFormReturn<FormValues>;
  isExpanded: boolean;
  onToggle: () => void;
  onGenerateVariations?: () => void;
  isDisabled?: boolean;
}) {
  // Watch attributes to trigger re-renders
  const attributes = form.watch('attributes') || [];
  
  return (
    <div className={`rounded-lg border bg-white dark:bg-gray-800 overflow-hidden h-fit shadow-sm transition-shadow ${
      isDisabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:shadow-md'
    }`}>
      <Collapsible open={isExpanded && !isDisabled} onOpenChange={isDisabled ? () => {} : onToggle}>
        <CollapsibleTrigger 
          className={`w-full p-4 flex items-center justify-between transition-colors ${
            isDisabled 
              ? 'cursor-not-allowed' 
              : 'hover:bg-gray-50'
          }`}
          disabled={isDisabled}
        >
          <div>
            <h5 className='font-medium mb-1'>Color</h5>
            <p className='text-sm text-gray-500'>
              {(() => {
                const colorAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color');
                const selectedCount = colorAttr?.options?.length || 0;
                return selectedCount > 0
                  ? `${selectedCount} color${selectedCount === 1 ? '' : 's'} selected`
                  : 'Click to add colors';
              })()}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className='p-4 pt-0'>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
            {DEFAULT_ATTRIBUTE_OPTIONS.color.map((option) => {
              const colorAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color');
              const isSelected = colorAttr?.options?.includes(option.value) || false;

              return (
                <div
                  key={option.value}
                  className={cn(
                    'relative flex items-center justify-center p-1 border-2 rounded-md cursor-pointer transition-all',
                    isSelected
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => {
                    if (isDisabled) return;
                    const updatedAttributes = [...attributes]; // Create new array
                    let colorAttrIndex = updatedAttributes.findIndex(
                      (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color'
                    );

                    if (colorAttrIndex === -1) {
                      updatedAttributes.push({
                        name: 'Color',
                        position: updatedAttributes.length,
                        visible: true,
                        variation: true,
                        options: [option.value]
                      });
                    } else {
                      const currentOptions = updatedAttributes[colorAttrIndex].options || [];
                      if (currentOptions.includes(option.value)) {
                        updatedAttributes[colorAttrIndex] = {
                          ...updatedAttributes[colorAttrIndex],
                          options: currentOptions.filter((opt: string) => opt !== option.value)
                        };
                        if (updatedAttributes[colorAttrIndex].options.length === 0) {
                          updatedAttributes.splice(colorAttrIndex, 1);
                        }
                      } else {
                        updatedAttributes[colorAttrIndex] = {
                          ...updatedAttributes[colorAttrIndex],
                          options: [...currentOptions, option.value]
                        };
                      }
                    }
                    form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                    // Auto-generation via watch subscription in useVariationHandlers
                  }}
                >
                  {/* {isSelected && (
                    <Check className='absolute top-1 right-1 h-4 w-4 text-primary' />
                  )} */}
                  <span className='font-medium capitalize'>{option.label}</span>
                </div>
              );
            })}
          </div>

          {/* Selected Colors Display */}
          {(() => {
            const colorAttr = attributes.find((attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color');
            const selectedColors = colorAttr?.options || [];
            
            if (selectedColors.length > 0) {
              return (
                <div className='mt-4 pt-4 border-t'>
                  <label className='mb-2 block text-sm font-medium'>Selected Colors:</label>
                  <div className='flex flex-wrap gap-2'>
                    {selectedColors.map((color: string) => (
                      <div key={color} className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md border'>
                        <span className='text-sm font-medium capitalize'>{color}</span>
                        <span className='w-0.75'></span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900'
                          onClick={() => {
                            const updatedAttributes = [...attributes]; // Create new array
                            const colorAttrIndex = updatedAttributes.findIndex(
                              (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color'
                            );
                            if (colorAttrIndex !== -1) {
                              updatedAttributes[colorAttrIndex] = {
                                ...updatedAttributes[colorAttrIndex],
                                options: updatedAttributes[colorAttrIndex].options.filter((opt: string) => opt !== color)
                              };
                              if (updatedAttributes[colorAttrIndex].options.length === 0) {
                                updatedAttributes.splice(colorAttrIndex, 1);
                              }
                              form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                              // Auto-generation via watch subscription in useVariationHandlers
                            }
                          }}
                        >
                          <Trash className='h-6 w-6 text-red-600' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Custom Color Input */}
          <div className='mt-4 pt-4 border-t'>
            <label className='mb-2 block text-sm font-medium'>Add Custom Color</label>
            <div className='flex items-center space-x-2'>
              <Input
                id='custom-color-input'
                placeholder='Enter custom color (e.g., Navy, Burgundy)'
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (isDisabled) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input && input.value.trim()) {
                      const updatedAttributes = [...attributes]; // Create new array
                      let colorAttrIndex = updatedAttributes.findIndex(
                        (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color'
                      );

                      if (colorAttrIndex === -1) {
                        updatedAttributes.push({
                          name: 'Color',
                          position: updatedAttributes.length,
                          visible: true,
                          variation: true,
                          options: [input.value.trim()]
                        });
                      } else {
                        const currentOptions = updatedAttributes[colorAttrIndex].options || [];
                        if (!currentOptions.includes(input.value.trim())) {
                          updatedAttributes[colorAttrIndex] = {
                            ...updatedAttributes[colorAttrIndex],
                            options: [...currentOptions, input.value.trim()]
                          };
                        }
                      }
                      form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                      // Auto-generation via watch subscription in useVariationHandlers
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  const input = document.getElementById('custom-color-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const updatedAttributes = [...attributes]; // Create new array
                    let colorAttrIndex = updatedAttributes.findIndex(
                      (attr: any) => 'name' in attr && attr.name.toLowerCase() === 'color'
                    );

                    if (colorAttrIndex === -1) {
                      updatedAttributes.push({
                        name: 'Color',
                        position: updatedAttributes.length,
                        visible: true,
                        variation: true,
                        options: [input.value.trim()]
                      });
                    } else {
                      const currentOptions = updatedAttributes[colorAttrIndex].options || [];
                      if (!currentOptions.includes(input.value.trim())) {
                        updatedAttributes[colorAttrIndex] = {
                          ...updatedAttributes[colorAttrIndex],
                          options: [...currentOptions, input.value.trim()]
                        };
                      }
                    }
                    form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                    // Auto-generation via watch subscription in useVariationHandlers
                    input.value = '';
                  }
                }}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Custom Attributes Component
function CustomAttributes({
  form,
  onRemoveAttribute,
  onRemoveOption,
  onGenerateVariations
}: {
  form: UseFormReturn<FormValues>;
  onRemoveAttribute: (index: number) => void;
  onRemoveOption: (attributeIndex: number, optionIndex: number) => void;
  onGenerateVariations?: () => void;
}) {
  const [newOptionValues, setNewOptionValues] = React.useState<Record<number, string>>({});

  // Watch attributes to trigger re-renders
  const attributes = form.watch('attributes') || [];

  // Clean up reserved attribute names automatically - normalize to canonical forms
  React.useEffect(() => {
    const nameMappings: Record<string, string> = {
      'sizes': 'Size',
      'colors': 'Color',
      'colours': 'Color',
      'colour': 'Color'
    };
    
    const needsRenaming = attributes.some((attr: any) => {
      const attrName = 'name' in attr ? attr.name.toLowerCase() : '';
      return attrName in nameMappings;
    });

    if (needsRenaming) {
      // Map reserved names to canonical forms
      const cleanedAttributes = attributes.map((attr: any) => {
        const attrName = 'name' in attr ? attr.name.toLowerCase() : '';
        if (attrName in nameMappings) {
          return {
            ...attr,
            name: nameMappings[attrName]
          };
        }
        return attr;
      });
      
      form.setValue('attributes', cleanedAttributes, { shouldDirty: true, shouldTouch: true });
      // Zustand automatically triggers re-renders on state change
    }
  }, [attributes, form]);

  return (
    <div className='space-y-3'>
      {attributes.map((attribute: any, attrIndex: number) => {
        const attributeName = 'name' in attribute ? attribute.name : `Attribute ${attrIndex + 1}`;
        
        // Skip Size and Color as they're handled above
        if (attributeName.toLowerCase() === 'size' || attributeName.toLowerCase() === 'color') {
          return null;
        }

        return (
          <div key={attrIndex} className='rounded-lg border p-4 bg-white dark:bg-gray-800 shadow-sm'>
            {/* Attribute Name and Remove Button */}
            <div className='flex items-center gap-3 mb-3'>
               <Input
                 value={attributeName}
                 onChange={(e) => {
                   const newName = e.target.value;
                   const reservedNames = ['size', 'color', 'sizes', 'colors', 'colour', 'colours'];
                   
                   // Don't allow reserved names
                   if (reservedNames.includes(newName.toLowerCase())) {
                     return;
                   }
                   
                   const updatedAttributes = [...attributes]; // Create new array
                   if ('name' in updatedAttributes[attrIndex]) {
                     updatedAttributes[attrIndex] = {
                       ...updatedAttributes[attrIndex],
                       name: newName
                     };
                     form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                     // Zustand automatically triggers re-renders on state change
                   }
                 }}
                 placeholder='Attribute name (e.g., Material)'
                 className='flex-1 h-9'
               />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => onRemoveAttribute(attrIndex)}
                className='hover:bg-red-50 hover:text-red-600'
              >
                <Trash className='h-4 w-4' />
              </Button>
            </div>

             {/* Toggles */}
             <div className='flex items-center gap-6 mb-3'>
               <div className='flex items-center gap-2 text-sm'>
                 <span>Visible on product page</span>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div className='inline-block'>
                       <Switch
                         checked={attribute.visible}
                         disabled={!attribute.options || attribute.options.length === 0}
                         onCheckedChange={(checked) => {
                           const updatedAttributes = [...attributes]; // Create new array
                           updatedAttributes[attrIndex] = {
                             ...updatedAttributes[attrIndex],
                             visible: checked
                           };
                           form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                           // Zustand automatically triggers re-renders on state change
                         }}
                       />
                     </div>
                   </TooltipTrigger>
                   {(!attribute.options || attribute.options.length === 0) && (
                     <TooltipContent>
                       <p>Add an option before enabling visibility</p>
                     </TooltipContent>
                   )}
                 </Tooltip>
               </div>

               <div className='flex items-center gap-2 text-sm'>
                 <span>Used for variations</span>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div className='inline-block'>
                       <Switch
                         checked={attribute.variation}
                         disabled={!attribute.options || attribute.options.length === 0}
                         onCheckedChange={(checked) => {
                           const updatedAttributes = [...attributes]; // Create new array
                           updatedAttributes[attrIndex] = {
                             ...updatedAttributes[attrIndex],
                             variation: checked
                           };
                           form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                           // Auto-generation via watch subscription in useVariationHandlers
                         }}
                       />
                     </div>
                   </TooltipTrigger>
                   {(!attribute.options || attribute.options.length === 0) && (
                     <TooltipContent>
                       <p>Add an option before enabling variations</p>
                     </TooltipContent>
                   )}
                 </Tooltip>
               </div>
             </div>

            {/* Options as Badges */}
            <div>
              <label className='mb-2 block text-sm font-medium'>Options</label>
              <div className='flex flex-wrap gap-2 mb-2'>
                {attribute.options?.map((option: string, optionIndex: number) => (
                  <div 
                    key={optionIndex} 
                    className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md border border-gray-200 hover:border-gray-300 transition-colors'
                  >
                    <span className='text-sm'>{option}</span>
                    <button
                      type='button'
                      onClick={() => onRemoveOption(attrIndex, optionIndex)}
                      className='hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-0.5 transition-colors'
                    >
                      <Trash className='h-3 w-3 text-red-600' />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Add Option */}
              <div className='flex items-center gap-2'>
                <Input
                  value={newOptionValues[attrIndex] || ''}
                  onChange={(e) => setNewOptionValues({ ...newOptionValues, [attrIndex]: e.target.value })}
                  placeholder='Add option (press Enter)'
                  className='h-9 flex-1'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = newOptionValues[attrIndex]?.trim();
                      if (value) {
                        const updatedAttributes = [...attributes]; // Create new array
                        const currentOptions = updatedAttributes[attrIndex].options || [];
                        updatedAttributes[attrIndex] = {
                          ...updatedAttributes[attrIndex],
                          options: [...currentOptions, value]
                        };
                        form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                        setNewOptionValues({ ...newOptionValues, [attrIndex]: '' });
                        // Auto-generation via watch subscription in useVariationHandlers
                      }
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const value = newOptionValues[attrIndex]?.trim();
                    if (value) {
                      const updatedAttributes = [...attributes]; // Create new array
                      const currentOptions = updatedAttributes[attrIndex].options || [];
                      updatedAttributes[attrIndex] = {
                        ...updatedAttributes[attrIndex],
                        options: [...currentOptions, value]
                      };
                      form.setValue('attributes', updatedAttributes, { shouldDirty: true, shouldTouch: true });
                      setNewOptionValues({ ...newOptionValues, [attrIndex]: '' });
                      // Auto-generation via watch subscription in useVariationHandlers
                    }
                  }}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

