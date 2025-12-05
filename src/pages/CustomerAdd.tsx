import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useData, CardType } from '@/contexts/DataContext';
import { toast } from 'sonner';

export default function CustomerAdd() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCustomer } = useData();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCard: '',
    cardType: '普' as CardType,
    openDate: format(new Date(), 'yyyy-MM-dd'),
    balance: '',
    giftAmount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('请输入客户姓名');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('请输入手机号');
      return;
    }

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      idCard: formData.idCard,
      cardType: formData.cardType,
      openDate: formData.openDate,
      balance: Number(formData.balance) || 0,
      giftAmount: Number(formData.giftAmount) || 0,
      salesId: user?.staffNo || '',
    });

    toast.success('客户添加成功');
    navigate('/customers');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="新增客户" />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              客户姓名 <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入客户姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              手机号 <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              身份证号
            </label>
            <Input
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              placeholder="请输入身份证号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              卡类型
            </label>
            <div className="flex gap-2">
              {(['普', '银', '金'] as CardType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, cardType: type })}
                  className={`flex-1 py-3 rounded-lg border text-center font-medium transition-colors ${
                    formData.cardType === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:bg-accent'
                  }`}
                >
                  {type}卡
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              开卡日期
            </label>
            <Input
              type="date"
              value={formData.openDate}
              onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              账户余额
            </label>
            <Input
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              赠送金额
            </label>
            <Input
              type="number"
              value={formData.giftAmount}
              onChange={(e) => setFormData({ ...formData, giftAmount: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="mobileSecondary"
            size="full"
            onClick={() => navigate(-1)}
          >
            取消
          </Button>
          <Button type="submit" variant="mobileAction" size="full">
            确认
          </Button>
        </div>
      </form>
    </div>
  );
}
