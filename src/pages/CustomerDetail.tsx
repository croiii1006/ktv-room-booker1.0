import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useData();

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="客户详情" />
        <div className="p-4 text-center text-muted-foreground">
          客户不存在
        </div>
      </div>
    );
  }

  const handleBookRoom = () => {
    navigate('/rooms', { state: { selectedCustomerId: customer.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="客户详情" />

      <main className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">账户余额</p>
          <p className="text-4xl font-bold text-foreground">
            ¥{customer.balance.toLocaleString()}
          </p>
          {customer.giftAmount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              含赠送金额 ¥{customer.giftAmount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-lg border border-border divide-y divide-border">
          <InfoRow label="客户姓名" value={customer.name} />
          <InfoRow label="客户编号" value={customer.id} />
          <InfoRow label="手机号" value={customer.phone} />
          <InfoRow label="身份证号" value={customer.idCard || '-'} />
          <InfoRow label="卡类型" value={`${customer.cardType}卡会员`} />
          <InfoRow label="开卡日期" value={customer.openDate} />
        </div>

        {/* Action Button */}
        <Button
          variant="mobileAction"
          size="full"
          onClick={handleBookRoom}
          className="mt-6"
        >
          订房
        </Button>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
