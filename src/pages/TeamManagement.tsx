import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
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
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

export default function TeamManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTeamMembers, addTeamMember, removeTeamMember, teamMembers } = useData();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMemberStaffNo, setNewMemberStaffNo] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  const myTeamMembers = getTeamMembers(user?.staffNo || '');

  const handleAddMember = () => {
    if (!newMemberStaffNo.trim() || !newMemberName.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    // Check if already assigned to another leader
    const existing = teamMembers.find((tm) => tm.staffNo === newMemberStaffNo);
    if (existing) {
      if (existing.leaderId === user?.staffNo) {
        toast.error('该业务员已在您的团队中');
      } else {
        toast.error('该业务员已被其他队长关联');
      }
      return;
    }

    addTeamMember({
      staffNo: newMemberStaffNo,
      name: newMemberName,
      leaderId: user?.staffNo || '',
    });

    toast.success('业务员添加成功');
    setShowAddDialog(false);
    setNewMemberStaffNo('');
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (confirm(`确定要删除业务员 ${name} 吗？`)) {
      removeTeamMember(id);
      toast.success('业务员已删除');
    }
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
          {myTeamMembers.length === 0 ? (
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
                  onClick={() => navigate(`/team/${member.staffNo}`)}
                >
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">工号: {member.staffNo}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMember(member.id, member.name);
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
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
                工号
              </label>
              <Input
                placeholder="请输入业务员工号"
                value={newMemberStaffNo}
                onChange={(e) => setNewMemberStaffNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                姓名
              </label>
              <Input
                placeholder="请输入业务员姓名"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="mobileSecondary" size="full" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button variant="mobileAction" size="full" onClick={handleAddMember}>
              确认添加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
