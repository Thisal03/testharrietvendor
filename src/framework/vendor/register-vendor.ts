import { VendorFormData } from '@/features/register/form-store';
import axios from 'axios';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL!;

/**
 * Register a new vendor
 */
export const registerVendor = async (formData: VendorFormData) => {
  return await axios.post(
    `${WOOCOMMERCE_API_URL}/wp-json/custom/v1/register-vendor`,
    formData,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

/**
 * Check if email is already registered
 */
export const checkEmailAvailability = async (email: string) => {
  const res = await axios.get(
    `${WOOCOMMERCE_API_URL}/wp-json/custom/v1/check-email`,
    {
      params: { email }
    }
  );
  return res.data; // { exists: true/false, message: string }
};

/**
 * Check if shop URL is already taken
 */
export const checkShopUrlAvailability = async (shopUrl: string) => {
  const res = await axios.get(
    `${WOOCOMMERCE_API_URL}/wp-json/custom/v1/check-shop-url`,
    {
      params: { shop_url: shopUrl }
    }
  );
  return res.data; // { exists: true/false, message: string }
};
