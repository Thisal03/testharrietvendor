'use client';
import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';
import { useRef, useEffect } from 'react';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
}

export function DataTable<TData>({
  table,
  actionBar,
  children
}: DataTableProps<TData>) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<React.ElementRef<typeof ScrollArea>>(null);
  
  useEffect(() => {
    const headerScroll = headerScrollRef.current;
    const bodyScroll = bodyScrollRef.current;
    
    if (!headerScroll || !bodyScroll) return;
    
    const syncHeaderScroll = (e: Event) => {
      if (bodyScroll) {
        const bodyViewport = bodyScroll.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (bodyViewport) {
          bodyViewport.scrollLeft = (e.target as HTMLElement).scrollLeft;
        }
      }
    };
    
    const syncBodyScroll = (e: Event) => {
      if (headerScroll) {
        const headerViewport = headerScroll.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (headerViewport) {
          headerViewport.scrollLeft = (e.target as HTMLElement).scrollLeft;
        }
      }
    };
    
    // Find the actual scrollable viewport elements within ScrollArea
    const headerViewport = headerScroll.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    const bodyViewport = bodyScroll.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    
    if (headerViewport && bodyViewport) {
      headerViewport.addEventListener('scroll', syncHeaderScroll);
      bodyViewport.addEventListener('scroll', syncBodyScroll);
      
      return () => {
        headerViewport.removeEventListener('scroll', syncHeaderScroll);
        bodyViewport.removeEventListener('scroll', syncBodyScroll);
      };
    }
  }, []);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {children}
      <div className='relative flex flex-1 min-h-[400px] rounded-lg border bg-white overflow-hidden'>
        {/* Fixed Header */}
        <div className='absolute top-0 left-0 right-0 z-20 bg-muted border-b'>
          <ScrollArea ref={headerScrollRef} className='h-auto'>
            <div className='overflow-x-auto'>
              <div style={{ width: '100%', minWidth: '800px' }}>
                <Table className='w-full' style={{ tableLayout: 'fixed' }}>
                  <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className='font-semibold text-foreground py-3 px-4'
                          style={{
                            ...getCommonPinningStyles({ column: header.column }),
                            width: header.getSize(),
                            minWidth: header.getSize()
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                  </TableHeader>
                </Table>
              </div>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
        
        {/* Scrollable Body */}
        <div className='absolute top-0 left-0 right-0 bottom-0 pt-[57px]'> {/* Adjust pt based on header height */}
          <ScrollArea ref={bodyScrollRef} className='h-full w-full'>
            <div className='overflow-x-auto'>
              <div style={{ width: '100%', minWidth: '800px' }}>
                <Table className='w-full' style={{ tableLayout: 'fixed' }}>
                  <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className='py-3 px-4'
                            style={{
                              ...getCommonPinningStyles({ column: cell.column }),
                              width: cell.column.getSize(),
                              minWidth: cell.column.getSize()
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        className='h-24 text-center text-muted-foreground'
                        style={{
                          width: '100%'
                        }}
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </div>
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
