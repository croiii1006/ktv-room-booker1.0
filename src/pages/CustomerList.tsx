import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberList } from '@/queries/member-queries';
import { MemberNameDisplay } from '@/components/MemberNameDisplay';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';

export default function CustomerList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Using React Query hook
  const { data: memberData, isLoading, error } = useMemberList();

  const customers = memberData?.data?.data?.list || [];

  if (isLoading) {
    return <div className="min-h-screen bg-background p-4 flex justify-center pt-20">加载中...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background p-4 flex justify-center pt-20">加载失败</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="我的客户"
        rightElement={
          <button
            onClick={() => navigate('/customers/add')}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Plus className="w-6 h-6 text-primary" />
          </button>
        }
      />

      <main className="p-4 space-y-3">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无客户</p>
            <button
              onClick={() => navigate('/customers/add')}
              className="mt-4 text-primary font-medium"
            >
              添加客户
            </button>
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => navigate(`/customers/${customer.id}`)}
              className="bg-card rounded-lg border border-border p-4 flex items-center justify-between active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                    {customer.cardTypeName || '普通会员'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  卡号: {customer.cardNo}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                   {customer.storeName && <span>门店: {customer.storeName}</span>}
                   {customer.staffName && <span>业务员: {customer.staffName}</span>}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-bold text-foreground">¥{(customer.balance || 0).toLocaleString()}</p>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-muted-foreground">余额</p>
                  {(customer.giftBalance || 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      赠送: ¥{customer.giftBalance?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
