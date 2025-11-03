import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { getProductById } from '@/framework/products/get-product-by-id';
import { ProductErrorBoundary } from '@/components/error-boundaries/ProductErrorBoundary';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Create New Product';

  if (productId !== 'new') {
    product = await getProductById(Number(productId), { noCache: true });
    if (!product) {
      notFound();
    }
    pageTitle = `Update Product`;
  }

  return (
    <ProductErrorBoundary>
      <ProductForm 
    key={`${product?.id || 'new'}-${product?.date_modified || Date.now()}`} 
    initialData={product} 
    pageTitle={pageTitle} 
      />
    </ProductErrorBoundary>
  );
}
