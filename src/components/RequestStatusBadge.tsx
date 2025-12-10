import React from 'react';
import { cn } from '@/lib/utils';
import { RequestStatus } from '@/contexts/DataContext';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: '待审核',
          className: 'bg-status-pending/20 text-status-pending border-status-pending',
        };
      case 'approved':
        return {
          label: '已通过',
          className: 'bg-status-booked/20 text-status-booked border-status-booked',
        };
      case 'rejected':
        return {
          label: '已驳回',
          className: 'bg-status-rejected/20 text-status-rejected border-status-rejected',
        };
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground border-border',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
