import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCreateMember } from '@/queries/member-queries';
import { useCardTypeList } from '@/queries/common-queries';

export default function CustomerAdd() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use Mutations and Queries
  const { mutateAsync: addCustomer, isPending: isSubmitting } = useCreateMember();
  const { data: cardTypesData } = useCardTypeList();
  
  const cardTypes = cardTypesData?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCard: '',
    cardTypeId: undefined as number | undefined,
    remark: '',
  });

  // Set default card type
  useEffect(() => {
    if (cardTypes.length > 0 && !formData.cardTypeId) {
      setFormData(prev => ({ ...prev, cardTypeId: cardTypes[0].id }));
    }
  }, [cardTypes, formData.cardTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('请输入客户姓名');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('请输入手机号');
      return;
    }

    if (!formData.cardTypeId) {
      toast.error('请选择卡类型');
      return;
    }

    try {
      await addCustomer({
        name: formData.name,
        phone: formData.phone,
        idCard: formData.idCard,
        cardTypeId: formData.cardTypeId,
        remark: formData.remark,
      });
      toast.success('客户添加成功');
      navigate('/customers');
    } catch (error: any) {
        // Error handling is mostly done in interceptors but we can catch here too
        console.error(error);
    }
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
              卡类型 <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {cardTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, cardTypeId: type.id })}
                  className={`flex-1 min-w-[80px] py-3 rounded-lg border text-center font-medium transition-colors ${
                    formData.cardTypeId === type.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:bg-accent'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            {cardTypes.length === 0 && (
               <p className="text-sm text-muted-foreground mt-1">暂无卡类型</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              备注
            </label>
            <Input
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="mobileSecondary"
            size="full"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button type="submit" variant="mobileAction" size="full" disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : '确认'}
          </Button>
        </div>
      </form>
    </div>
  );
}
