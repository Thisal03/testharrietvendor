import * as z from 'zod';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from './constants';

export const formSchema = z.object({
  images: z
    .any()
    .refine((files) => {
      if (!files) return false;
      const fileArray = Array.isArray(files) ? files : [files];
      return fileArray.length >= 1;
    }, 'At least one image is required.')
    .refine(
      (files) => {
        if (!files) return true;
        const fileArray = Array.isArray(files) ? files : [files];
        return fileArray.every((file: File) => file.size <= MAX_FILE_SIZE);
      },
      `Max file size is 5MB.`
    )
    .refine(
      (files) => {
        if (!files) return true;
        const fileArray = Array.isArray(files) ? files : [files];
        return fileArray.every((file: File) => ACCEPTED_IMAGE_TYPES.includes(file?.type));
      },
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.'
  }),
  type: z.string().min(1, 'Product type is required.'),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  short_description: z.string().min(10, {
    message: 'Short description must be at least 10 characters.'
  }),
  has_size_chart: z.boolean().optional(),
  size_chart: z.any().optional().refine(
    (files) => {
      if (!files) return true;
      const fileArray = Array.isArray(files) ? files : [files];
      if (fileArray.length === 0) return true;
      return fileArray.every((file: any) => {
        // Allow existing images (objects with src property)
        if (file && typeof file === 'object' && 'src' in file) return true;
        // Validate new file uploads
        return file instanceof File && file.size <= MAX_FILE_SIZE;
      });
    },
    `Max file size is 5MB.`
  ).refine(
    (files) => {
      if (!files) return true;
      const fileArray = Array.isArray(files) ? files : [files];
      if (fileArray.length === 0) return true;
      return fileArray.every((file: any) => {
        // Allow existing images
        if (file && typeof file === 'object' && 'src' in file) return true;
        // Validate new file uploads
        return file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file?.type);
      });
    },
    '.jpg, .jpeg, .png and .webp files are accepted.'
  ),
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
    .optional(),
  price: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), 'Price must be a valid positive number'),
  on_sale: z.boolean().optional(),
  sale_price: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), 'Sale price must be a valid positive number'),
  has_sale_dates: z.boolean().optional(),
  sale_start_date: z.string().optional(),
  sale_end_date: z.string().optional(),
  stock_status: z.enum(['instock', 'outofstock']).optional(),
  manage_stock: z.boolean().optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative.').optional(),
  sku: z.string()
    .optional()
    .refine(async (sku) => {
      if (!sku || sku.trim() === '') return true;
      
      try {
        const { checkSKUAvailability } = await import('@/framework/products/get-sku');
        const isAvailable = await checkSKUAvailability(sku.trim());
        return isAvailable;
      } catch (error) {
        console.error('SKU validation error:', error);
        return true; // Allow if validation fails
      }
    }, 'SKU is already taken. Please choose a different one.'),
  weight: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), 'Weight must be a valid positive number'),
  variations: z.array(
    z.object({
      id: z.string(),
      attributes: z.record(z.string(), z.string()),
      image: z.any().optional(),
      price: z.string()
        .min(1, 'Price is required')
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Price must be a valid positive number'),
      on_sale: z.boolean(),
      sale_price: z.string().optional()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), 'Sale price must be a valid positive number'),
      has_sale_dates: z.boolean(),
      sale_start_date: z.string().optional(),
      sale_end_date: z.string().optional(),
      stock_status: z.enum(['instock', 'outofstock']),
      manage_stock: z.boolean(),
      stock_quantity: z.number().min(0, 'Stock must be non-negative'),
      sku: z.string().optional(),
      weight: z.string().optional()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), 'Weight must be a valid positive number'),
      enabled: z.boolean()
    })
  ).optional()
}).superRefine((data, ctx) => {
  // For simple products, price and SKU are required
  if (data.type === 'simple') {
    if (!data.price || data.price.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price is required for simple products',
        path: ['price']
      });
    }
    
    if (!data.sku || data.sku.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SKU is required for simple products',
        path: ['sku']
      });
    }
  }
});

export type FormValues = z.infer<typeof formSchema>;

