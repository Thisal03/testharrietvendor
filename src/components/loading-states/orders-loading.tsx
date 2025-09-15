import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconLoader2 } from '@tabler/icons-react';

interface OrdersLoadingProps {
  message?: string;
  isError?: boolean;
}

export function OrdersLoading({ 
  message = "Loading orders...", 
  isError = false 
}: OrdersLoadingProps) {
  if (isError) {
    return (
      <Alert variant="destructive">
        <IconLoader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <IconLoader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
      <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
    </div>
  );
}
