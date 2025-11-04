import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/services/token';
import { config } from '@/framework/config';

/**
 * API route to check SKU availability
 * Proxies the request to WooCommerce API to avoid CORS issues
 * 
 * Query parameters:
 * - sku: The SKU to check
 * - excludeProductId: (optional) Product ID to exclude from check
 * - excludeVariationId: (optional) Variation ID to exclude from check
 * - checkDisabledVariations: (optional) Whether to check disabled variations in meta_data
 * - excludeVariationSku: (optional) SKU to exclude from disabled variation check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const excludeProductId = searchParams.get('excludeProductId');
    const excludeVariationId = searchParams.get('excludeVariationId');
    const checkDisabledVariations = searchParams.get('checkDisabledVariations') === 'true';
    const excludeVariationSku = searchParams.get('excludeVariationSku');

    if (!sku) {
      return NextResponse.json(
        { error: 'SKU parameter is required' },
        { status: 400 }
      );
    }

    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    // Fetch products with this SKU from WooCommerce
    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          isAvailable: false,
          confidence: 'low' as const,
          error: `Unable to verify SKU availability: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter out excluded products/variations
    const otherProducts = data.filter((product: any) => {
      if (excludeProductId && product.id === parseInt(excludeProductId, 10)) {
        return false;
      }
      if (excludeVariationId && product.id === parseInt(excludeVariationId, 10)) {
        return false;
      }
      return true;
    });
    
    // Check disabled variations in meta_data if requested
    if (checkDisabledVariations && excludeProductId) {
      try {
        const productId = parseInt(excludeProductId, 10);
        const productResponse = await fetch(
          `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (productResponse.ok) {
          const product = await productResponse.json();
          if (product?.meta_data) {
            const disabledVars = product.meta_data.find(
              (m: any) => m.key === '_disabled_variations'
            )?.value;
            
            if (disabledVars && typeof disabledVars === 'string') {
              const disabled = JSON.parse(disabledVars);
              // Check if SKU exists in disabled variations, but exclude the current variation's SKU
              const hasSKU = disabled.some((v: any) => {
                // Skip checking against the variation itself
                if (excludeVariationSku && v.sku === excludeVariationSku) {
                  return false;
                }
                return v.sku === sku;
              });
              
              if (hasSKU) {
                return NextResponse.json({
                  isAvailable: false,
                  confidence: 'high' as const,
                  error: 'SKU is reserved by a disabled variation'
                });
              }
            }
          }
        }
      } catch (metaError) {
        // Silently fail meta_data check, continue with WooCommerce check
        console.warn('Failed to check disabled variations:', metaError);
      }
    }
    
    const isAvailable = otherProducts.length === 0;
    
    return NextResponse.json({
      isAvailable,
      confidence: 'high' as const,
      ...(otherProducts.length > 0 && {
        existingProduct: {
          id: otherProducts[0].id,
          name: otherProducts[0].name,
          sku: otherProducts[0].sku,
          status: otherProducts[0].status
        }
      })
    });
  } catch (error) {
    console.error('Error checking SKU availability:', error);
    return NextResponse.json(
      {
        isAvailable: false,
        confidence: 'low' as const,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

