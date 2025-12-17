import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTeamList, useCreateTeamMember } from '@/queries/team-queries';

export default function TeamManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: teamData, isLoading, isError, error } = useTeamList();
  const { mutateAsync: addTeamMember, isPending: isSubmitting } = useCreateTeamMember();

  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '', // staffNo
    name: '',
    password: '',
    phone: '',
  });

  const myTeamMembers = teamData?.data?.data?.list || [];

  const handleAddMember = async () => {
    if (!formData.username.trim() || !formData.name.trim() || !formData.password.trim() || !formData.phone.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      await addTeamMember({
        staffNo: formData.username,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        role: 'sales', // Default role for team members added by leader
      });
      toast.success('业务员添加成功');
      setShowAddDialog(false);
      setFormData({ username: '', name: '', password: '', phone: '' });
    } catch (error) {
       console.error(error);
       // Error handled by global interceptor typically
    }
  };

  const handleRemoveMember = (id: string, name: string) => {
    // Implement remove logic if API supports it. Currently only create is supported in hooks.
    // If remove is needed, need to add to team-queries.ts
    // For now showing toast
    toast.error('暂不支持删除功能');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="团队管理" />

      <main className="p-4 space-y-4">
        {/* Add Button */}
        <Button
          variant="mobile"
          size="full"
          onClick={() => setShowAddDialog(true)}
          className="justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增业务员
        </Button>

        {/* Team Members List */}
        <div className="space-y-3">
          {isLoading ? (
             <div className="text-center py-12">
             <p className="text-muted-foreground">加载中...</p>
           </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive">加载失败: {error?.message || '未知错误'}</p>
              <Button 
                variant="ghost" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                重试
              </Button>
            </div>
          ) : myTeamMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无团队成员</p>
            </div>
          ) : (
            myTeamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/team/${member.id}`)}
                >
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">手机: {member.phone || 'N/A'}</p>
                </div>
                {/* 
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMember(member.id?.toString() || '', member.name || '');
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
                */}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm mx-4 rounded-xl">
          <DialogHeader>
            <DialogTitle>新增业务员</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                工号 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入业务员工号"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                姓名 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入业务员姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                密码 <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                placeholder="请输入登录密码"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                手机号 <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="mobileSecondary" size="full" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button variant="mobileAction" size="full" onClick={handleAddMember} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              确认添加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
