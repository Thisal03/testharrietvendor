'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState, useOptimistic, startTransition, useEffect } from 'react';
import {
  Package,
  User,
  CreditCard,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Order } from '@/framework/orders/types';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/status-badge';
import { updateOrderStatus } from '@/framework/orders/update-order-status';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

import PrintWaybill from './print-waybill';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { getProductFeaturedImage } from '@/framework/products/get-product-images';
import { ImageWithZoom } from '@/components/ui/image-with-zoom';

// Component to handle product image display
function ProductImageDisplay({ productId, productName, fallbackImage }: { 
  productId: number; 
  productName: string; 
  fallbackImage?: any;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getProductFeaturedImage(productId);
        setImageUrl(url);
      } catch (error) {
        console.error('Failed to fetch product image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchImage();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className='flex h-[50px] w-[50px] items-center justify-center rounded-sm bg-muted animate-pulse'>
        <Package className='h-6 w-6 text-muted-foreground' />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <ImageWithZoom
        src={imageUrl}
        alt={productName}
        width={50}
        height={50}
        zoomScale={4}
      >
        <img
          src={imageUrl}
          alt={productName}
          width={50}
          height={50}
          className='rounded-sm object-cover'
          onError={() => {
            console.error('Failed to load image:', imageUrl);
            setImageUrl(null);
          }}
        />
      </ImageWithZoom>
    );
  }

  // Fallback to order item image if available
  if (fallbackImage && fallbackImage.thumbnail && fallbackImage.thumbnail.trim() !== '') {
    return (
      <ImageWithZoom
        src={fallbackImage.thumbnail}
        alt={fallbackImage.alt || productName}
        width={50}
        height={50}
        zoomScale={4}
      >
        <Image
          src={fallbackImage.thumbnail}
          alt={fallbackImage.alt || productName}
          width={50}
          height={50}
          className='rounded-sm object-cover'
        />
      </ImageWithZoom>
    );
  }

  // Final fallback
  return (
    <div className='flex h-[50px] w-[50px] items-center justify-center rounded-sm bg-muted text-muted-foreground'>
      <Package className='h-6 w-6' />
    </div>
  );
}

export default function OrderDetailsPage({ order }: { order: Order }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  

  const [optimisticOrder, updateOptimisticOrder] = useOptimistic(
    order,
    (state, newStatus: string) => ({
      ...state,
      status: newStatus
    })
  );



  const handleStatusChange = async () => {
    setIsSaving(true);
    setModalOpen(false);
    
    startTransition(() => {
      updateOptimisticOrder('ready-to-ship');
    });
    
    try {
              if (order.id) {
          await updateOrderStatus(order.id, 'ready-to-ship');
        }
      toast.success('Order status updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      startTransition(() => {
        updateOptimisticOrder(order.status);
      });
      toast.error('Failed to update order status');
    } finally {
      setIsSaving(false);
    }
  };

  const hasTrackingCode = Boolean(
    optimisticOrder.meta_data?.find((meta) => meta.key === 'citypak_tracking_code')
      ?.value?.[0]
  );

  return (
    <>
      <div className='min-h-screen'>
        <div className='space-y-8'>
          {/* Header */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='outline'
                size='icon'
                className='bg-transparent'
                onClick={() => router.back()}
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div>
                <h1 className='text-xl font-semibold tracking-tight'>
                  Order #{order.number || 'N/A'}
                </h1>
                <p className='text-muted-foreground'>
                  Created {order.date_created?.date ? format(order.date_created.date, 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 lg:w-96'>
              {/* <Button variant='outline' size='sm'>
                <Download className='mr-1 h-4 w-4' />
                Export
              </Button> */}
              {hasTrackingCode && order.id && (
                <PrintWaybill order={order} />
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
            {/* Main Content */}
            <div className='space-y-8 lg:col-span-8'>
              {/* Order Items */}
              <Card className='shadow-sm'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Package className='text-muted-foreground h-5 w-5' />
                    <CardTitle>Order Items</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='rounded-lg border'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-muted/50'>
                          <TableHead className='font-semibold'>
                            Product
                          </TableHead>
                          <TableHead className='text-center font-semibold'>
                            Quantity
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Price
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.line_items && Object.values(order.line_items).length > 0 ? (
                          Object.values(order.line_items).map((item, index) => (
                            <TableRow
                              key={item.id || index}
                              className={
                                index % 2 === 0 ? 'bg-muted/20' : 'bg-muted/40'
                              }
                            >
                              <TableCell className='flex items-center gap-2 font-medium'>
                                <ProductImageDisplay 
                                  productId={item.product_id}
                                  productName={item.name || 'Unnamed Product'}
                                  fallbackImage={item.product_image}
                                />
                                <span>{item.name || 'Unnamed Product'}</span>
                              </TableCell>
                              <TableCell className='text-center'>
                                <Badge variant='secondary' className='font-mono'>
                                  {item.quantity || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-right font-semibold'>
                                {formatPrice(Number(item.total || 0))}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className='text-center py-8 text-muted-foreground'>
                              No items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Billing Address */}
                <Card className='shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center gap-2'>
                      <CreditCard className='text-muted-foreground h-5 w-5' />
                      <CardTitle>Billing Address</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <User className='text-muted-foreground h-4 w-4' />
                      <span className='font-medium capitalize'>
                        {order.billing?.first_name || 'N/A'} {order.billing?.last_name || ''}
                      </span>
                    </div>
                    {order.billing?.company && (
                      <div className='flex items-center gap-2'>
                        <Building className='text-muted-foreground h-4 w-4' />
                        <span>{order.billing.company}</span>
                      </div>
                    )}
                    <div className='flex items-start gap-2'>
                      <MapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                      <div className='space-y-1 text-sm'>
                        <p>{order.billing?.address_1 || 'N/A'}</p>
                        {order.billing?.address_2 && (
                          <p>{order.billing.address_2}</p>
                        )}
                        <p>
                          {order.billing?.city || 'N/A'}, {order.billing?.state || 'N/A'}{' '}
                          {order.billing?.postcode || 'N/A'}
                        </p>
                        {order.billing?.country && (
                          <p>{order.billing.country}</p>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Mail className='text-muted-foreground h-4 w-4' />
                      <a
                        href={`mailto:${order.billing?.email || '#'}`}
                        className='text-blue-600 hover:underline'
                      >
                        {order.billing?.email || 'N/A'}
                      </a>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='text-muted-foreground h-4 w-4' />
                      <a
                        href={`tel:${order.billing?.phone || '#'}`}
                        className='text-blue-600 hover:underline'
                      >
                        {order.billing?.phone || 'N/A'}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className='shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center gap-2'>
                      <Package className='text-muted-foreground h-5 w-5' />
                      <CardTitle>Shipping Address</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    {order.shipping?.address_1 ? (
                      <>
                        <div className='flex items-center gap-2'>
                          <User className='text-muted-foreground h-4 w-4' />
                          <span className='font-medium capitalize'>
                            {order.shipping?.first_name || 'N/A'}{' '}
                            {order.shipping?.last_name || ''}
                          </span>
                        </div>
                        {order.shipping?.company && (
                          <div className='flex items-center gap-2'>
                            <Building className='text-muted-foreground h-4 w-4' />
                            <span>{order.shipping.company}</span>
                          </div>
                        )}
                        <div className='flex items-start gap-2'>
                          <MapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                          <div className='space-y-1 text-sm'>
                            <p>{order.shipping?.address_1 || 'N/A'}</p>
                            {order.shipping?.address_2 && (
                              <p>{order.shipping.address_2}</p>
                            )}
                            <p>
                              {order.shipping?.city || 'N/A'}, {order.shipping?.state || 'N/A'}{' '}
                              {order.shipping?.postcode || 'N/A'}
                            </p>
                            {order.shipping?.country && (
                              <p>{order.shipping.country}</p>
                            )}
                          </div>
                        </div>
                        {order.shipping?.phone && (
                          <div className='flex items-center gap-2'>
                            <Phone className='text-muted-foreground h-4 w-4' />
                            <a
                              href={`tel:${order.shipping.phone}`}
                              className='text-blue-600 hover:underline'
                            >
                              {order.shipping.phone}
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <p>Shipping address is the same as billing address</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Information */}
              <Card className='shadow-sm'>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1'>
                  <div>
                    <h3 className='text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase'>
                      Customer Note
                    </h3>
                    <p className='bg-muted/50 rounded-lg p-3 text-sm'>
                      {order.customer_note || 'No customer note provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6 lg:col-span-4'>
              {/* Order Summary */}
              <Card className='sticky shadow-sm'>
                <CardHeader className=''>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Status */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Current Status
                      </span>
                      <StatusBadge status={optimisticOrder.status || 'unknown'} showIcon={false} />
                      {isSaving && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Updating...
                        </div>
                      )}
                    </div>
                      {optimisticOrder.status === 'processing' && optimisticOrder.id && (
                              <Button
                                size='sm'
                                className='w-full bg-red-500 hover:bg-red-800 text-white border-red-800 hover:border-red-800'
                                onClick={() => setModalOpen(true)}
                                disabled={isSaving}
                              >
                                {isSaving ? 'Updating...' : 'Set as Ready to Ship'}
                              </Button>
                            )}
                  </div>

                  <Separator />

                  {/* Dates */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='text-muted-foreground h-4 w-4' />
                      <span className='font-medium'>Created:</span>
                      <span className='text-muted-foreground'>
                        {order.date_created?.date ? format(
                          new Date(order.date_created.date),
                          'MMM dd, yyyy'
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='text-muted-foreground h-4 w-4' />
                      <span className='font-medium'>Modified:</span>
                      <span className='text-muted-foreground'>
                        {order.date_modified?.date ? format(
                          new Date(order.date_modified.date),
                          'MMM dd, yyyy'
                        ) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Info */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <CreditCard className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Payment Method
                      </span>
                    </div>
                    <p className='pl-6 text-sm'>{order.payment_method_title || 'N/A'}</p>
                    {order.transaction_id && (
                      <div className='pl-6'>
                        <span className='text-muted-foreground text-xs'>
                          Transaction ID:
                        </span>
                        <code className='bg-muted/50 ml-2 rounded px-1 py-0.5 text-xs'>
                          {order.transaction_id}
                        </code>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className='space-y-3'>
                    <div className='flex justify-between text-sm'>
                      <span>Subtotal</span>
                      <span>{formatPrice(Number(order.total || 0))}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Shipping</span>
                      <span>
                        {order.shipping_total
                          ? formatPrice(Number(order.shipping_total))
                          : 'Free Shipping'}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between text-lg font-semibold'>
                      <span>Total</span>
                                              <span className='text-green-600'>
                          {formatPrice(Number(order.total || 0))}
                        </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={'Update Order Status'}
        description={
          'Are you sure you want to set this order as ready to ship? This action cannot be undone.'
        }
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className='flex justify-end gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button size='sm' onClick={handleStatusChange} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                Saving
              </>
            ) : (
              'Set as Ready to Ship'
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}
