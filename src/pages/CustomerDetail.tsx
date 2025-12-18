import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useMemberDetail } from '@/queries/member-queries';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use Query hook
  const { data: detailData, isLoading, error } = useMemberDetail(parseInt(id || '0'));
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="客户详情" />
        <div className="p-4 text-center text-muted-foreground">
          加载中...
        </div>
      </div>
    );
  }

  if (error || !detailData?.data || !detailData.data.success || !detailData.data.data) {
     return (
      <div className="min-h-screen bg-background">
        <PageHeader title="客户详情" />
        <div className="p-4 text-center text-muted-foreground">
          {error ? '加载失败' : '客户不存在'}
        </div>
      </div>
    );
  }

  const m = detailData.data.data;
  // Adapter to match existing UI usage or use data directly
  const customer = {
    id: m.id?.toString() || '',
    name: m.name || '',
    phone: m.phone || '',
    idCard: '', 
    cardType: m.cardTypeName || '普',
    cardTypeId: m.cardTypeId,
    openDate: m.createdAt ? format(new Date(m.createdAt), 'yyyy-MM-dd HH:mm') : '-',
    balance: m.balance || 0,
    giftAmount: m.giftBalance || 0,
    salesId: m.staffId?.toString() || '',
    storeName: m.storeName || '',
    staffName: m.staffName || '',
    cardNo: m.cardNo || '',
  };

  const handleBookRoom = () => {
    navigate(`/rooms/${customer.id}`);
  };

  const handleRecharge = () => {
    navigate(`/recharge/${customer.id}`);
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
          <InfoRow label="会员卡号" value={customer.cardNo || '-'} />
          <InfoRow label="手机号" value={customer.phone} />
          <InfoRow label="卡类型" value={`${customer.cardType}`} />
          {customer.storeName && <InfoRow label="所属门店" value={customer.storeName} />}
          {customer.staffName && <InfoRow label="所属业务员" value={customer.staffName} />}
          <InfoRow label="开卡日期" value={customer.openDate} />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          <Button
            variant="mobileAction"
            size="full"
            onClick={handleBookRoom}
          >
            订房
          </Button>
          <Button
            variant="mobile"
            size="full"
            onClick={handleRecharge}
          >
            充值申请
          </Button>
        </div>
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
