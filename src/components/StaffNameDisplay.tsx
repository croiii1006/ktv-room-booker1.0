import React from 'react';
import { useLookupStaff } from '@/queries/lookup-queries';
import { cn } from '@/lib/utils';

interface StaffNameDisplayProps {
  id?: number | string;
  initialName?: string;
  staffNo?: string;
  className?: string;
  fallback?: React.ReactNode;
  showStaffNo?: boolean;
}

export const StaffNameDisplay: React.FC<StaffNameDisplayProps> = ({ 
  id, 
  initialName, 
  staffNo,
  className,
  fallback = '未知员工',
  showStaffNo = false
}) => {
  // Try to use initial name if valid
  const isValidInitialName = initialName && initialName !== 'Unknown' && initialName !== '未知';
  
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const isValidId = !isNaN(numericId || 0) && (numericId || 0) > 0;
  
  const { data, isLoading } = useLookupStaff(numericId || 0);

  // If we have an initial name, we can show it, but if showStaffNo is true and we don't have it, we might still want to fetch?
  // For simplicity, if we have initial name, we use it. If showStaffNo is needed, the caller should usually provide it if available.
  // However, if we really need consistent data, fetching is safer.
  // Let's stick to: use initial if available to save bandwidth.
  
  let displayName = initialName;
  let displayStaffNo = staffNo;

  if (!isValidInitialName && isValidId) {
    if (isLoading) {
       return <span className={cn("animate-pulse w-16 h-4 bg-muted rounded inline-block align-middle", className)} />;
    }
    const staff = data?.data?.data;
    if (staff) {
      displayName = staff.name;
      displayStaffNo = staff.staffNo;
    }
  }

  if (!displayName) {
    return <span className={cn("text-muted-foreground", className)}>{fallback}</span>;
  }

  return (
    <span className={className}>
      {displayName}
      {showStaffNo && displayStaffNo && <span className="text-muted-foreground ml-1">({displayStaffNo})</span>}
    </span>
  );
};
