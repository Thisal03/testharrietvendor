import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { getProductById } from '@/framework/products/get-product-by-id';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Create New Product';

  if (productId !== 'new') {
    product = await getProductById(Number(productId));
    if (!product) {
      notFound();
    }
    pageTitle = `Update Product`;
  }

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
