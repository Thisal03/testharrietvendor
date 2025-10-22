import { z } from 'zod';

export const step1Schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
  shopUrl: z.string().min(2, 'Shop URL is required'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions'
  })
});

export const step2Schema = z.object({
  street: z.string().min(3, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(3, 'Post/Zip code is required'),
  country: z.string().min(2, 'Please select a country'),
  state: z.string().min(1, 'Please select a state/province'),
  storeCategory: z.string().min(1, 'Store category is required')
});

export const step3Schema = z.object({
  accountHolder: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAddress: z.string().optional(),
  bankIban: z.string().optional(),
  bankSwiftCode: z.string().optional(),
  attestOwnership: z.boolean().optional()
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
