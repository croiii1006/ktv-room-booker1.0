import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

export default function RechargeRequest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { customers, addRechargeRequest, getLeaderIdForSales } = useData();

  const customer = customers.find((c) => c.id === id);

  const [amount, setAmount] = useState('');
  const [giftProduct, setGiftProduct] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="充值申请" />
        <div className="p-4 text-center text-muted-foreground">
          客户不存在
        </div>
      </div>
    );
  }

  const handleImageUpload = () => {
    setImageUrl(`https://placeholder.pics/svg/300x200/DEDEDE/555555/凭证${Date.now()}`);
    toast.success('凭证上传成功');
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效的充值金额');
      return;
    }

    const leaderId = getLeaderIdForSales(user?.staffNo || '');
    if (!leaderId) {
      toast.error('未找到关联的队长，请联系管理员');
      return;
    }

    addRechargeRequest({
      customerId: customer.id,
      customerName: customer.name,
      amount: parseFloat(amount),
      giftProduct: giftProduct,
      imageUrl: imageUrl || undefined,
      status: 'pending',
      salesId: user?.staffNo || '',
      salesName: user?.name || '',
      salesStaffNo: user?.staffNo || '',
      leaderId,
    });

    toast.success('充值申请已提交');
    navigate('/recharge-requests');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="充值申请" />

      <main className="p-4 space-y-4">
        {/* Customer Info */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-medium text-foreground mb-2">客户信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户姓名</span>
              <span className="font-medium">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">手机号</span>
              <span className="font-medium">{customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">卡类型</span>
              <span className="font-medium">{customer.cardType}卡会员</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">当前余额</span>
              <span className="font-medium text-primary">¥{customer.balance}</span>
            </div>
          </div>
        </div>

        {/* Recharge Form */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              充值金额 *
            </label>
            <Input
              type="number"
              placeholder="请输入充值金额"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              赠送产品
            </label>
            <Textarea
              placeholder="请输入赠送产品说明（如有）"
              value={giftProduct}
              onChange={(e) => setGiftProduct(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              上传凭证截图
            </label>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="凭证" className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs"
                >
                  删除
                </button>
              </div>
            ) : (
              <button
                onClick={handleImageUpload}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
              >
                <Plus className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">点击上传凭证</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="mobileSecondary" size="full" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button variant="mobileAction" size="full" onClick={handleSubmit}>
            提交申请
          </Button>
        </div>
      </main>
    </div>
  );
}
