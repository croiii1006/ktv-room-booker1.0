import React from 'react';
import { cn } from '@/lib/utils';
import { BookingStatus } from '@/contexts/DataContext';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  free: { label: '可预订', className: 'bg-muted text-muted-foreground' },
  pending: { label: '待审核', className: 'bg-status-pending/20 text-amber-700' },
  booked: { label: '已预订', className: 'bg-status-booked/20 text-green-700' },
  finished: { label: '已完成', className: 'bg-status-finished/20 text-red-700' },
  rejected: { label: '已驳回', className: 'bg-status-rejected/20 text-red-700' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
