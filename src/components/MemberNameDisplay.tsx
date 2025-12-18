import React from 'react';
import { useLookupMember } from '@/queries/lookup-queries';
import { cn } from '@/lib/utils';

interface MemberNameDisplayProps {
  id?: number | string;
  initialName?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const MemberNameDisplay: React.FC<MemberNameDisplayProps> = ({ 
  id, 
  initialName, 
  className,
  fallback = '未知客户'
}) => {
  // Try to use initial name if valid (not empty/null/undefined/Unknown)
  const isValidInitialName = initialName && initialName !== 'Unknown' && initialName !== '未知';
  
  // Always call hook unconditionally, but control enabled state
  // Convert ID to number safely
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const isValidId = !isNaN(numericId || 0) && (numericId || 0) > 0;
  
  const { data, isLoading } = useLookupMember(numericId || 0, { 
    enabled: !isValidInitialName && isValidId 
  });

  if (isValidInitialName) {
    return <span className={className}>{initialName}</span>;
  }

  if (!isValidId) {
    return <span className={cn("text-muted-foreground", className)}>{fallback}</span>;
  }

  if (isLoading) {
    return <span className={cn("animate-pulse w-16 h-4 bg-muted rounded inline-block align-middle", className)} />;
  }

  const fetchedName = data?.data?.data?.name;
  
  return <span className={className}>{fetchedName || fallback}</span>;
};
