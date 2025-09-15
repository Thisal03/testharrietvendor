'use client';

import { FileUploader } from '@/components/file-uploader';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/framework/products/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const formSchema = z.object({
  images: z
    .any()
    .refine((files) => files?.length >= 1, 'At least one image is required.')
    .refine(
      (files) => files?.every((file: File) => file.size <= MAX_FILE_SIZE),
      `Max file size is 5MB.`
    )
    .refine(
      (files) =>
        files?.every((file: File) => ACCEPTED_IMAGE_TYPES.includes(file?.type)),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.'
  }),
  type: z.string().default('variable'),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  short_description: z.string().min(10, {
    message: 'Short description must be at least 10 characters.'
  }),
  categories: z
    .array(
      z.object({
        id: z.number().positive('Category ID must be positive')
      })
    )
    .min(1, 'At least one category is required'),
  attributes: z
    .array(
      z.union([
        z.object({
          id: z.number().positive('Attribute ID must be positive'),
          position: z.number(),
          visible: z.boolean(),
          variation: z.boolean(),
          options: z.array(z.string()).min(1, 'At least one option is required')
        }),
        z.object({
          name: z.string().min(1, 'Attribute name is required'),
          position: z.number(),
          visible: z.boolean(),
          variation: z.boolean(),
          options: z.array(z.string()).min(1, 'At least one option is required')
        })
      ])
    )
    .optional(),
  default_attributes: z
    .array(
      z.union([
        z.object({
          id: z.number().positive('Attribute ID must be positive'),
          option: z.string().min(1, 'Option is required')
        }),
        z.object({
          name: z.string().min(1, 'Attribute name is required'),
          option: z.string().min(1, 'Option is required')
        })
      ])
    )
    .optional()
});

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const defaultValues = {
    images:
      initialData?.gallery_image_ids?.map((id) => ({
        src: id
      })) || [],
    name: initialData?.name || '',
    type: 'variable',
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
    categories: initialData?.category_ids?.map((id) => ({ id })) || [],
    attributes: Array.isArray(initialData?.attributes)
      ? initialData.attributes
      : [],
    default_attributes: Array.isArray(initialData?.default_attributes)
      ? initialData.default_attributes
      : []
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Handle form submission
  };

  // Helper functions for dynamic fields
  const addAttribute = () => {
    const attributes = form.getValues('attributes') || [];
    form.setValue('attributes', [
      ...attributes,
      {
        name: '',
        position: attributes.length,
        visible: false,
        variation: false,
        options: []
      }
    ]);
  };

  const removeAttribute = (index: number) => {
    const attributes = form.getValues('attributes') || [];
    attributes.splice(index, 1);
    form.setValue('attributes', attributes);
  };

  const addOption = (attributeIndex: number) => {
    const attributes = form.getValues('attributes') || [];
    const options = attributes[attributeIndex].options || [];
    attributes[attributeIndex].options = [...options, ''];
    form.setValue('attributes', attributes);
  };

  const removeOption = (attributeIndex: number, optionIndex: number) => {
    const attributes = form.getValues('attributes') || [];
    attributes[attributeIndex].options.splice(optionIndex, 1);
    form.setValue('attributes', attributes);
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={4}
                        maxSize={4 * 1024 * 1024}
                        // disabled={loading}
                        // progresses={progresses}
                        // pass the onUpload function here for direct upload
                        // onUpload={uploadFiles}
                        // disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} label='Product Name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select product type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='simple'>Simple</SelectItem>
                        <SelectItem value='variable'>Variable</SelectItem>
                        <SelectItem value='grouped'>Grouped</SelectItem>
                        <SelectItem value='external'>External</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='short_description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter short product description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter product description'
                      className='min-h-[120px] resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className='mb-4 text-lg font-medium'>Categories</h3>
              <div className='space-y-4'>
                {form.getValues('categories')?.map((category, index) => (
                  <div key={index} className='flex items-center space-x-4'>
                    <Input
                      type='number'
                      value={category.id}
                      onChange={(e) => {
                        const categories = form.getValues('categories');
                        categories[index].id = Number(e.target.value);
                        form.setValue('categories', categories);
                      }}
                      placeholder='Category ID'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => {
                        const categories = form.getValues('categories');
                        categories.splice(index, 1);
                        form.setValue('categories', categories);
                      }}
                    >
                      <Trash className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const categories = form.getValues('categories');
                    form.setValue('categories', [...categories, { id: 0 }]);
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Category
                </Button>
              </div>
            </div>

            {/* <div>
              <h3 className='mb-4 text-lg font-medium'>Attributes</h3>
              <div className='space-y-6'>
                {form.getValues('attributes')?.map((attribute, attrIndex) => (
                  <div key={attrIndex} className='rounded-lg border p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <h4 className='font-medium'>
                        {attribute.name || `Attribute ${attrIndex + 1}`}
                      </h4>
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        onClick={() => removeAttribute(attrIndex)}
                      >
                        <Trash className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div>
                        <label className='mb-1 block text-sm font-medium'>
                          Name
                        </label>
                        <Input
                          value={attribute.name || ''}
                          onChange={(e) => {
                            const attributes = form.getValues('attributes');
                            attributes[attrIndex].name = e.target.value;
                            form.setValue('attributes', attributes);
                          }}
                          placeholder='Attribute name'
                        />
                      </div>

                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            id={`visible-${attrIndex}`}
                            checked={attribute.visible}
                            onChange={(e) => {
                              const attributes = form.getValues('attributes');
                              attributes[attrIndex].visible = e.target.checked;
                              form.setValue('attributes', attributes);
                            }}
                          />
                          <label htmlFor={`visible-${attrIndex}`}>
                            Visible
                          </label>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            id={`variation-${attrIndex}`}
                            checked={attribute.variation}
                            onChange={(e) => {
                              const attributes = form.getValues('attributes');
                              attributes[attrIndex].variation =
                                e.target.checked;
                              form.setValue('attributes', attributes);
                            }}
                          />
                          <label htmlFor={`variation-${attrIndex}`}>
                            Used for variations
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <label className='mb-2 block text-sm font-medium'>
                        Options
                      </label>
                      <div className='space-y-2'>
                        {attribute.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className='flex items-center space-x-2'
                          >
                            <Input
                              value={option}
                              onChange={(e) => {
                                const attributes = form.getValues('attributes');
                                attributes[attrIndex].options[optionIndex] =
                                  e.target.value;
                                form.setValue('attributes', attributes);
                              }}
                              placeholder='Option value'
                            />
                            <Button
                              type='button'
                              variant='destructive'
                              size='sm'
                              onClick={() =>
                                removeOption(attrIndex, optionIndex)
                              }
                            >
                              <Trash className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => addOption(attrIndex)}
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type='button' variant='outline' onClick={addAttribute}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Attribute
                </Button>
              </div>
            </div>

            <div>
              <h3 className='mb-4 text-lg font-medium'>Default Attributes</h3>
              <div className='space-y-4'>
                {form.getValues('default_attributes')?.map((attr, index) => (
                  <div key={index} className='flex items-center space-x-4'>
                    <Input
                      value={attr.name || ''}
                      onChange={(e) => {
                        const defaultAttrs =
                          form.getValues('default_attributes');
                        defaultAttrs[index].name = e.target.value;
                        form.setValue('default_attributes', defaultAttrs);
                      }}
                      placeholder='Attribute name'
                    />
                    <Input
                      value={attr.option}
                      onChange={(e) => {
                        const defaultAttrs =
                          form.getValues('default_attributes');
                        defaultAttrs[index].option = e.target.value;
                        form.setValue('default_attributes', defaultAttrs);
                      }}
                      placeholder='Default option'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => {
                        const defaultAttrs =
                          form.getValues('default_attributes');
                        defaultAttrs.splice(index, 1);
                        form.setValue('default_attributes', defaultAttrs);
                      }}
                    >
                      <Trash className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const defaultAttrs =
                      form.getValues('default_attributes') || [];
                    form.setValue('default_attributes', [
                      ...defaultAttrs,
                      { name: '', option: '' }
                    ]);
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Default Attribute
                </Button>
              </div>
            </div> */}

            <Button type='submit'>Save Product</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
