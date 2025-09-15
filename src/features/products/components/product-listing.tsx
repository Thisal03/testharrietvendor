import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';
import { getProducts } from '@/framework/products/get-products';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

type ProductListingPage = {};

export default async function ProductListingPage({}: ProductListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');

  const filters = {
    page,
    per_page: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  const products = await getProducts(filters);
  if (!products)
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;

  const totalProducts = products.pagination.total;

  return (
    <ProductTable
      data={products.data}
      totalItems={totalProducts}
      columns={columns}
    />
  );
}
