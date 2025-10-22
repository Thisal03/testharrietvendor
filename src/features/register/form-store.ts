import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AxiosResponse } from 'axios';

export interface VendorFormData {
  // Step 1: Personal/Business Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  shopName: string;
  shopUrl: string;
  agreeToTerms: boolean;

  // Step 2: Store Setup
  street: string;
  street2: string;
  city: string;
  zipCode: string;
  country: string;
  storeCategory: string;

  // Step 3: Payment Setup
  accountHolder: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  bankAddress: string;
  bankIban: string;
  bankSwiftCode: string;
  attestOwnership: boolean;
}

interface FormStore {
  currentStep: number;
  previousStep: number;
  formData: VendorFormData;
  isSubmitting: boolean;
  response: AxiosResponse | null;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<VendorFormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setResponse: (response: AxiosResponse | null) => void;
}

const initialFormData: VendorFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  shopName: '',
  shopUrl: '',
  agreeToTerms: false,
  street: '',
  street2: '',
  city: '',
  zipCode: '',
  country: '',
  storeCategory: 'Uncategorized',
  accountHolder: '',
  accountType: '',
  accountNumber: '',
  routingNumber: '',
  bankName: '',
  bankAddress: '',
  bankIban: '',
  bankSwiftCode: '',
  attestOwnership: false
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      previousStep: 1,
      formData: initialFormData,
      isSubmitting: false,
      response: null,
      setCurrentStep: (step) =>
        set((state) => ({
          previousStep: state.currentStep,
          currentStep: step
        })),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data }
        })),
      resetForm: () =>
        set({
          currentStep: 1,
          previousStep: 1,
          formData: initialFormData,
          isSubmitting: false,
          response: null
        }),
      nextStep: () =>
        set((state) => ({
          previousStep: state.currentStep,
          currentStep: Math.min(state.currentStep + 1, 4)
        })),
      prevStep: () =>
        set((state) => ({
          previousStep: state.currentStep,
          currentStep: Math.max(state.currentStep - 1, 1)
        })),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setResponse: (response) => set({ response })
    }),
    {
      name: 'vendor-form-storage'
    }
  )
);
