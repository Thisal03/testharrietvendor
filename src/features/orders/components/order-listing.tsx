import { searchParamsCache } from '@/lib/searchparams';
import { OrderTable } from './order-tables';
import { columns } from './order-tables/columns';
import { getOrders } from '@/framework/orders/get-orders';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconAlertCircle } from '@tabler/icons-react';
import { logger } from '@/lib/logger';
import { auth } from '@/auth';

type OrderListingPage = {};

export default async function OrderListingPage({}: OrderListingPage) {
  try {
    // Session is already validated in the page component
    const session = await auth();
    
    logger.log('OrderListingPage - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasToken: !!session?.access_token,
      tokenLength: session?.access_token?.length || 0,
      userName: session?.user?.name
    });

    // Showcasing the use of search params cache in nested RSCs
    const page = searchParamsCache.get('page') || 1;
    const pageLimit = searchParamsCache.get('perPage') || 10;
    const statuses = searchParamsCache.get('status');

    const filters = {
      page: Number(page),
      per_page: Number(pageLimit),
      ...(statuses && { status: statuses })
    };

    logger.log('Fetching orders with filters:', filters);
    logger.log('User session:', { 
      user: session?.user?.name, 
      hasToken: !!session?.access_token 
    });

    const orders = await getOrders(filters);
    
    if (!orders) {
      return (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load orders. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      );
    }

    const totalOrders = orders.pagination.total;
    logger.log('Orders loaded successfully:', { 
      count: orders.data.length, 
      total: totalOrders 
    });

    return (
      <OrderTable data={orders.data} totalItems={totalOrders} columns={columns} />
    );
  } catch (error) {
    logger.error('Error in OrderListingPage:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('not authenticated')) {
      return (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to view your orders.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert variant="destructive">
        <IconAlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          An error occurred while loading orders. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
}
