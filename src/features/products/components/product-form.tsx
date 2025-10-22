'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FloatingLabelInput as Input } from '@/components/ui/floating-input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ProgressiveImageUploader } from '@/components/progressive-image-uploader';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Product } from '@/framework/products/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formSchema, FormValues } from './product-form-components/schema';
import { ProductTypeSelector } from './product-form-components/product-type-selector';
import { SimpleProductSettings } from './product-form-components/simple-product-settings';
import { VariableProductSettings } from './product-form-components/variable-product-settings';
import { Variation } from './product-form-components/types';
import { createProduct } from '@/framework/products/create-product';
import { updateProduct } from '@/framework/products/update-product';
import { uploadMultipleImages, UploadedImage } from '@/framework/products/upload-product-image';
import { createMultipleVariations } from '@/framework/products/create-variation';
import { 
  transformFormDataToWooCommerce, 
  transformVariationsData,
  prepareImageUploads 
} from './product-form-components/helpers';
import { useProductData } from './product-form-components/use-product-data';
import { getVendorInfo } from '@/framework/vendor/get-vendor-info';
import { invalidateTag } from '@/framework/revalidate';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, HelpCircle } from 'lucide-react';
import { ProgressModal } from '@/components/ui/progress-modal';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const { categories: dynamicCategories, isLoading: isCategoriesLoading } = useProductData();
  const [vendorId, setVendorId] = React.useState<number | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>(
    initialData?.category_ids || []
  );
  const [expandedAttributes, setExpandedAttributes] = React.useState<Set<string>>(new Set());
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const [variations, setVariations] = React.useState<Variation[]>([]);
  const [expandedVariations, setExpandedVariations] = React.useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSKUValid, setIsSKUValid] = React.useState(true);
  
  // Progress modal state
  const [showProgress, setShowProgress] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState<'idle' | 'uploading' | 'creating' | 'success' | 'error'>('idle');
  const [progressMessage, setProgressMessage] = React.useState('');

  // Fetch vendor ID
  React.useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const vendorInfo = await getVendorInfo();
        if (vendorInfo?.id) {
          setVendorId(vendorInfo.id);
        }
      } catch (error) {
        console.error('Failed to fetch vendor info:', error);
      }
    };
    
    fetchVendorId();
  }, []);

  // Debug: Log variations state changes
  React.useEffect(() => {
    console.log('🔄 Variations state updated:', variations.length, 'variations', variations);
  }, [variations]);

  const defaultValues: Partial<FormValues> = React.useMemo(() => {
    // Determine product type - WooCommerce variable products have attributes
    const productType = initialData?.attributes && 
      Object.keys(initialData.attributes).length > 0 
      ? 'variable' 
      : 'simple';

    // Check if product is on sale
    const isOnSale = !!(initialData?.sale_price && initialData.sale_price !== '');

    // Get size chart from meta_data - check both ACF and fallback keys
    const sizeChartUrl = initialData?.meta_data?.find(
      (meta) => meta.key === 'size_chart_group' || meta.key === '_size_chart_image'
    )?.value;

    return {
      images: initialData?.gallery_image_ids?.map((id) => ({ src: id })) || [],
    name: initialData?.name || '',
      type: productType,
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
      has_size_chart: !!sizeChartUrl,
      size_chart: sizeChartUrl ? [{ src: sizeChartUrl }] : [],
    categories: initialData?.category_ids?.map((id) => ({ id })) || [],
      attributes: initialData?.attributes 
        ? Object.entries(initialData.attributes).map(([key, attr]: any, index) => ({
            name: attr.name || key,
            position: attr.position || index,
            visible: attr.visible !== false,
            variation: attr.variation !== false,
            options: attr.options || []
          }))
      : [],
    default_attributes: Array.isArray(initialData?.default_attributes)
      ? initialData.default_attributes
        : [],
      price: initialData?.regular_price || initialData?.price || '',
      on_sale: isOnSale,
      sale_price: initialData?.sale_price || '',
      has_sale_dates: !!(initialData?.date_on_sale_from?.date || initialData?.date_on_sale_to?.date),
      sale_start_date: initialData?.date_on_sale_from?.date 
        ? new Date(initialData.date_on_sale_from.date).toISOString().split('T')[0]
        : '',
      sale_end_date: initialData?.date_on_sale_to?.date
        ? new Date(initialData.date_on_sale_to.date).toISOString().split('T')[0]
        : '',
      stock_status: (initialData?.stock_status === 'instock' || initialData?.stock_status === 'outofstock') 
        ? initialData.stock_status 
        : 'instock',
      manage_stock: initialData?.manage_stock || false,
      stock_quantity: initialData?.stock_quantity || 0,
      sku: initialData?.sku || '',
      weight: initialData?.weight || '',
      variations: []
    };
  }, [initialData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if SKU is valid before proceeding
      if (!isSKUValid) {
        toast.error('Please fix the SKU validation error before submitting');
        setIsSubmitting(false);
        return;
      }
      
      // Initialize progress modal
      setShowProgress(true);
      setProgress(0);
      setProgressStatus('uploading');
      setProgressMessage('Preparing images...');
      
      console.log('Form submitted with values:', values);
      console.log('Categories in form submission:', values.categories);

      // Prepare images for upload
      const { mainImages, existingImages, sizeChart, existingSizeChart, variationImages } = prepareImageUploads(values);
      
      // Calculate total steps for progress tracking
      const totalSteps = mainImages.length + (sizeChart ? 1 : 0) + variationImages.size + 2; // +2 for product creation and variations
      let completedSteps = 0;

      // Upload main product images
      console.log('Uploading main images:', mainImages.length, 'files');
      const uploadedMainImages: UploadedImage[] = [];
      for (const file of mainImages) {
        setProgressMessage(`Uploading image ${uploadedMainImages.length + 1} of ${mainImages.length}...`);
        const uploaded = await uploadMultipleImages([file]);
        uploadedMainImages.push(...uploaded);
        completedSteps++;
        setProgress((completedSteps / totalSteps) * 50); // First 50% for uploads
      }
      console.log('Uploaded main images:', uploadedMainImages);
      
      // Combine uploaded images with existing images
      const allImages = [...existingImages, ...uploadedMainImages];
      console.log('All images to send to WooCommerce:', allImages);

      // Upload size chart if new file, otherwise use existing
      let sizeChartToUse: UploadedImage | { src: string; id?: number } | undefined = undefined;
      if (sizeChart) {
        setProgressMessage('Uploading size chart...');
        sizeChartToUse = await uploadMultipleImages([sizeChart]).then(imgs => imgs[0]);
        completedSteps++;
        setProgress((completedSteps / totalSteps) * 50);
      } else if (existingSizeChart) {
        sizeChartToUse = { src: existingSizeChart };
      }

      // Upload variation images
      const uploadedVariationImages = new Map();
      if (variationImages.size > 0) {
        const variationImageEntries = Array.from(variationImages.entries());
        let variationImageCount = 0;
        for (const [variationId, imageFile] of variationImageEntries) {
          variationImageCount++;
          setProgressMessage(`Uploading variation image ${variationImageCount} of ${variationImages.size}...`);
          const uploadedImage = await uploadMultipleImages([imageFile]).then(imgs => imgs[0]);
          uploadedVariationImages.set(variationId, uploadedImage);
          completedSteps++;
          setProgress((completedSteps / totalSteps) * 50);
        }
      }

      // Switch to creating status
      setProgress(50);
      setProgressStatus('creating');
      setProgressMessage(initialData ? 'Updating product...' : 'Creating product...');

      // Transform form data to WooCommerce format
      const productData = transformFormDataToWooCommerce(values, allImages, sizeChartToUse);

      // Create or update product
      let product;
      if (initialData?.id) {
        product = await updateProduct(initialData.id, productData);
        completedSteps++;
        setProgress(75);
      } else {
        product = await createProduct(productData);
        console.log('Product created successfully:', product);
        completedSteps++;
        setProgress(70);
        
        // If variable product, create variations
        if (values.type === 'variable' && values.variations && values.variations.length > 0) {
          setProgressMessage('Creating product variations...');
          
          const variationsData = transformVariationsData(values, uploadedVariationImages);
          await createMultipleVariations(product.id, variationsData);
          completedSteps++;
          setProgress(90);
        }
      }

      // Revalidate product cache
      setProgressMessage('Finalizing...');
      await invalidateTag('products');
      if (product?.id) {
        await invalidateTag(`product-${product.id}`);
      }
      
      await fetch('/api/revalidate?path=/dashboard/product', { method: 'POST' }).catch(() => {});
      
      setProgress(100);
      setProgressStatus('success');
      setProgressMessage('Product created successfully!');

      // Wait a moment before redirecting
      setTimeout(() => {
        setShowProgress(false);
        router.push('/dashboard/product');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setProgressStatus('error');
      setProgressMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to save product. Please try again.'
      );
      
      // Auto-close error after 3 seconds
      setTimeout(() => {
        setShowProgress(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for dynamic fields
  const addAttribute = () => {
    const attributes = form.getValues('attributes') || [];
    
    // Check if we can add more attributes (limit is 3)
    if (attributes.length >= 3) {
      console.log('⚠️ Cannot add more attributes: limit of 3 reached');
      return;
    }
    
    const newAttributes = [
      ...attributes,
      {
        name: '',
        position: attributes.length,
        visible: false,
        variation: false,
        options: []
      }
    ];
    console.log('➕ Adding new attribute:', newAttributes);
    form.setValue('attributes', newAttributes, { shouldDirty: true, shouldTouch: true });
    forceUpdate();
  };

  const removeAttribute = (index: number) => {
    const attributes = [...(form.getValues('attributes') || [])]; // Create new array
    attributes.splice(index, 1);
    console.log('➖ Removing attribute at index', index, ':', attributes);
    form.setValue('attributes', attributes, { shouldDirty: true, shouldTouch: true });
    forceUpdate();
  };

  const addOption = (attributeIndex: number) => {
    const attributes = [...(form.getValues('attributes') || [])]; // Create new array
    const options = attributes[attributeIndex].options || [];
    attributes[attributeIndex] = {
      ...attributes[attributeIndex],
      options: [...options, '']
    };
    console.log('➕ Adding option to attribute', attributeIndex);
    form.setValue('attributes', attributes, { shouldDirty: true, shouldTouch: true });
    forceUpdate();
  };

  const removeOption = (attributeIndex: number, optionIndex: number) => {
    const attributes = [...(form.getValues('attributes') || [])]; // Create new array
    const options = [...attributes[attributeIndex].options];
    options.splice(optionIndex, 1);
    
    // If this was the last option, disable variation toggle
    const willHaveNoOptions = options.length === 0;
    
    attributes[attributeIndex] = {
      ...attributes[attributeIndex],
      options,
      // Disable variation if no options remain
      variation: willHaveNoOptions ? false : attributes[attributeIndex].variation,
      visible: willHaveNoOptions ? false : attributes[attributeIndex].visible
    };
    
    console.log('➖ Removing option', optionIndex, 'from attribute', attributeIndex);
    if (willHaveNoOptions) {
      console.log('🔄 Disabled variation toggle - no options remaining');
    }
    
    form.setValue('attributes', attributes, { shouldDirty: true, shouldTouch: true });
    forceUpdate();
    
    // Trigger variation generation if variation was disabled
    if (willHaveNoOptions) {
      setTimeout(() => {
        generateVariations();
        forceUpdate();
      }, 150);
    }
  };

  const toggleAttributeExpansion = (attributeName: string) => {
    setExpandedAttributes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attributeName)) {
        newSet.delete(attributeName);
      } else {
        newSet.add(attributeName);
      }
      return newSet;
    });
  };

  const generateVariations = React.useCallback(() => {
    const attributes = form.getValues('attributes') || [];
    console.log('🔄 Generating variations from attributes:', attributes);
    
    const variationAttributes = attributes.filter((attr) => attr.variation);
    console.log('✅ Variation-enabled attributes:', variationAttributes);
    
    if (variationAttributes.length === 0) {
      console.log('⚠️ No variation attributes found, clearing variations');
      setVariations([]);
      form.setValue('variations', []);
      return;
    }

    // Generate all combinations
    const combinations: Variation[] = [];
    const generate = (index: number, current: any) => {
      if (index === variationAttributes.length) {
        // Try to preserve existing variation data if it matches
        const existingVar = variations.find(v => {
          return Object.entries(current).every(([key, val]) => v.attributes[key] === val);
        });

        combinations.push({
          id: existingVar?.id || `var-${Date.now()}-${Math.random()}`,
          attributes: { ...current },
          image: existingVar?.image || null,
          price: existingVar?.price || '',
          on_sale: existingVar?.on_sale || false,
          sale_price: existingVar?.sale_price || '',
          has_sale_dates: existingVar?.has_sale_dates || false,
          sale_start_date: existingVar?.sale_start_date || '',
          sale_end_date: existingVar?.sale_end_date || '',
          stock_status: existingVar?.stock_status || 'instock',
          manage_stock: existingVar?.manage_stock || false,
          stock_quantity: existingVar?.stock_quantity || 0,
          sku: existingVar?.sku || '',
          weight: existingVar?.weight || '',
          enabled: existingVar?.enabled ?? true
        });
        return;
      }

      const attr = variationAttributes[index];
      const attrName = 'name' in attr ? attr.name : '';
      attr.options?.forEach((option) => {
        generate(index + 1, { ...current, [attrName]: option });
      });
    };

    generate(0, {});
    console.log('📦 Generated variations:', combinations.length, 'variations');
    setVariations(combinations);
    form.setValue('variations', combinations as any);
  }, [form, variations]);

  // Manually trigger variation generation when attributes change
  const triggerVariationGeneration = React.useCallback(() => {
    console.log('🎯 Manual trigger: Generating variations...');
    generateVariations();
    forceUpdate();
  }, [generateVariations, forceUpdate]);

  // Auto-generate variations when attributes change (Shopify-style)
  React.useEffect(() => {
    if (form.watch('type') === 'variable') {
      console.log('🎯 Setting up attribute watch for variations');
      
      const subscription = form.watch((value, { name, type }) => {
        console.log('👀 Form field changed:', name, 'type:', type);
        
        // Watch for any attribute changes
        if (name === 'attributes' || name?.startsWith('attributes.')) {
          console.log('🔔 Attributes changed, triggering variation generation');
          setTimeout(() => {
            generateVariations();
            forceUpdate(); // Force UI update
          }, 100);
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [form, generateVariations, forceUpdate]);

  // Clear images when product type changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'type' && type === 'change') {
        console.log('🔄 Product type changed, clearing images');
        
        // Clear main product images
        form.setValue('images', []);
        
        // Clear size chart
        form.setValue('size_chart', []);
        form.setValue('has_size_chart', false);
        
        // Clear variation images
        setVariations(prevVariations => 
          prevVariations.map(variation => ({
            ...variation,
            image: null
          }))
        );
        
        // Force UI update
        forceUpdate();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, forceUpdate]);

  const updateVariation = (index: number, field: string | Record<string, any>, value?: any) => {
    // Support both single field update and multiple fields update
    const updates = typeof field === 'string' ? { [field]: value } : field;
    
    console.log(`Updating variation ${index}, updates:`, updates);
    
    setVariations((prevVariations) => {
      const updatedVariations = [...prevVariations];
      updatedVariations[index] = {
        ...updatedVariations[index],
        ...updates
      };
      console.log('Updated variation:', updatedVariations[index]);
      form.setValue('variations', updatedVariations as any);
      return updatedVariations;
    });
  };

  const toggleVariationExpansion = (variationId: string) => {
    setExpandedVariations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variationId)) {
        newSet.delete(variationId);
      } else {
        newSet.add(variationId);
      }
      return newSet;
    });
  };

  return (
    <TooltipProvider>
      <Card className='mx-auto w-full max-w-5xl shadow-sm'>
        <CardHeader className='border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
          <p className='text-sm text-muted-foreground mt-1'>
            Fill in the required information below to create your product
          </p>
        </CardHeader>
        <CardContent className='pt-3'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Basic Information Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
                  <span className='text-sm font-bold'>1</span>
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Basic Information</h3>
                  <p className='text-xs text-muted-foreground'>Product name and descriptions</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter product name' className='w-full'/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
                {/* Left side - Short Description */}
                <div className='lg:col-span-1'>
                  <FormField
                    control={form.control}
                    name='short_description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description *</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder='Brief summary of your product'
                            className='resize-none min-h-[120px]'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right side - Size Chart Toggle */}
                <div className='lg:col-span-1 pt-5.5'>
                  <div className='space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm h-fit'>
                    <FormField
                      control={form.control}
                      name='has_size_chart'
                      render={({ field }) => (
                        <FormItem>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 flex-1'>
                              <FormLabel 
                                htmlFor='has-size-chart'
                                className='cursor-pointer !mt-0 font-medium text-sm'
                              >
                                This product has a size chart
                              </FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className='h-3 w-3 text-muted-foreground cursor-help' />
                                </TooltipTrigger>
                                <TooltipContent className='max-w-xs'>
                                  <p className='text-sm'>
                                    Enable this if your product needs a size guide (e.g., clothing, shoes, accessories). 
                                    You can upload an image showing size measurements or charts to help customers choose the right size.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Switch
                              id='has-size-chart'
                              checked={field.value || false}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (!checked) {
                                  form.setValue('size_chart', []);
                                }
                              }}
                            />
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch('has_size_chart') && (
                      <FormField
                        control={form.control}
                        name='size_chart'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-sm'>Size Chart Image</FormLabel>
                              <FormControl>
                              <ProgressiveImageUploader
                                value={field.value}
                                onValueChange={field.onChange}
                                maxFiles={1}
                                maxSize={5 * 1024 * 1024}
                              />
                              </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Bottom - Long Description (spans full width) */}
                <div className='lg:col-span-3'>
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Description *</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder='Enter detailed product description...'
                            className='min-h-[200px]'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Product Type Selection */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
                  <span className='text-sm font-bold'>2</span>
                    </div>
                      <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg font-semibold'>Product Type</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <p className='text-sm'>
                          <strong>Simple Product:</strong> A single product with one price and no variations.
                          <br /><br />
                          <strong>Variable Product:</strong> A product with multiple variations (like different sizes, colors) with individual prices and inventory.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className='text-xs text-muted-foreground'>Choose between simple or variable product</p>
                </div>
              </div>
              <ProductTypeSelector form={form} />
            </div>


            {/* Conditional Fields Based on Product Type */}
            {form.watch('type') === 'simple' && (
              <SimpleProductSettings
                form={form}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                dynamicCategories={dynamicCategories}
                isCategoriesLoading={isCategoriesLoading}
                vendorId={vendorId}
              />
            )}

            {form.watch('type') === 'variable' && (
              <VariableProductSettings
                form={form}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                dynamicCategories={dynamicCategories}
                isCategoriesLoading={isCategoriesLoading}
                expandedAttributes={expandedAttributes}
                onToggleAttributeExpansion={toggleAttributeExpansion}
                onForceUpdate={forceUpdate}
                onAddAttribute={addAttribute}
                onRemoveAttribute={removeAttribute}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                variations={variations}
                expandedVariations={expandedVariations}
                onToggleVariationExpansion={toggleVariationExpansion}
                onUpdateVariation={updateVariation}
                onGenerateVariations={triggerVariationGeneration}
                vendorId={vendorId}
              />
            )}

            {/* Action Buttons */}
            <div className='flex items-center justify-between pt-6 mt-8 border-t'>
              <p className='text-sm text-muted-foreground italic'>
                * Required fields
              </p>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/product')}
                  disabled={isSubmitting}
                  size='lg'
                  className='min-w-[120px]'
                >
                  Cancel
                </Button>
                <Button 
                  type='submit' 
                  disabled={isSubmitting} 
                  size='lg'
                  className='min-w-[160px] shadow-sm'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {initialData ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    initialData ? 'Update Product' : 'Create Product'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    
    {/* Progress Modal */}
    <ProgressModal
      isOpen={showProgress}
      progress={progress}
      status={progressStatus}
      message={progressMessage}
      onClose={() => setShowProgress(false)}
    />
    </TooltipProvider>
  );
}

