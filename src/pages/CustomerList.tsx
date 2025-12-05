import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function CustomerList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCustomersByStaff } = useData();

  const customers = user ? getCustomersByStaff(user.staffNo) : [];

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
              <div>
                <h3 className="font-semibold text-foreground">{customer.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {customer.cardType}卡会员
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">¥{customer.balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">余额</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
