import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCreateRecharge } from '@/queries/recharge-queries';
import { useUploadFile } from '@/queries/common-queries';
import { useMemberDetail } from '@/queries/member-queries';

export default function RechargeRequest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { mutateAsync: createRecharge, isPending: isSubmitting } = useCreateRecharge();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { data: customerData, isLoading: isLoadingCustomer } = useMemberDetail(id || '');

  const customer = customerData?.data?.data;

  const [amount, setAmount] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (isLoadingCustomer) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="充值申请" />
        <div className="p-4 text-center text-muted-foreground">
          加载中...
        </div>
      </div>
    );
  }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFile(file);
      if (res.data && res.data.data) {
        setImageUrl(res.data.data);
        toast.success('凭证上传成功');
      } else {
        toast.error('上传失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('上传出错');
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效的充值金额');
      return;
    }

    if (!user?.storeId) {
      toast.error('当前账号未绑定门店，无法操作');
      return;
    }

    try {
      await createRecharge({
        memberId: customer.id,
        storeId: user.storeId,
        staffId: user.id,
        amount: parseFloat(amount),
        giftAmount: giftAmount ? parseFloat(giftAmount) : 0,
        voucherUrls: imageUrl ? [imageUrl] : [],
        remark: remark,
      });
      toast.success('充值申请提交成功');
      navigate('/recharge-requests');
    } catch (error) {
        // Error handling done in interceptor usually
        console.error(error);
    }
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
              <span className="font-medium">{customer.cardTypeName || '普通'}卡会员</span>
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
              赠送金额
            </label>
             <Input
              type="number"
              placeholder="请输入赠送金额（可选）"
              value={giftAmount}
              onChange={(e) => setGiftAmount(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-foreground mb-2">
              备注
            </label>
            <Textarea
              placeholder="请输入备注（如有）"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
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
              <div className="relative">
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                 />
                <div
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isUploading ? '上传中...' : '点击上传凭证'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="mobileSecondary" size="full" onClick={() => navigate(-1)} disabled={isSubmitting}>
            取消
          </Button>
          <Button variant="mobileAction" size="full" onClick={handleSubmit} disabled={isSubmitting || isUploading}>
            {isSubmitting ? '提交中...' : '提交申请'}
          </Button>
        </div>
      </main>
    </div>
  );
}
