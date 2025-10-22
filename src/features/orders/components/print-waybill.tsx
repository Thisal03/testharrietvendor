'use client';
import { Button } from '@/components/ui/button';
import { Order } from '@/framework/orders/types';
import { getWaybill } from '@/framework/tracking/get-waybill';
import { Loader2, Printer } from 'lucide-react';
import React from 'react';

const PrintWaybill = ({ order }: { order: Order }) => {
  const [loading, setLoading] = React.useState(false);

  const trackingCode = order.meta_data.find(
    (meta) => meta.key === 'citypak_tracking_code'
  )?.value[0];

  const downloadWaybill = async () => {
    if (!trackingCode) return;

    try {
      setLoading(true);
      const waybillBlob = await getWaybill(trackingCode);
      const pdfURL = URL.createObjectURL(waybillBlob);
      const link = document.createElement('a');
      link.href = pdfURL;
      link.download = `Waybill_${order.id}_${trackingCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Waybill download failed:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button 
      variant='outline' 
      size='sm' 
      onClick={downloadWaybill}
      className='bg-red-500 hover:bg-red-800 text-white border-red-600 hover:border-red-800 hover:text-white w-full h-10'
    >
      {loading ? (
        <Loader2 className='mr-1 size-4 animate-spin' />
      ) : (
        <Printer className='mr-1 size-4' />
      )}
      Print Waybill
    </Button>
  );
};

export default PrintWaybill;
