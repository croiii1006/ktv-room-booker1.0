import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account.trim() || !password.trim()) {
      toast.error('请输入账号和密码');
      return;
    }

    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = login(account, password);
    
    if (success) {
      toast.success('登录成功');
      navigate('/home');
    } else {
      toast.error('账号或密码错误');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">KTV</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">KTV预订系统</h1>
            <p className="mt-2 text-muted-foreground">请登录您的账号</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                账号
              </label>
              <Input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入账号"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                密码
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="mobileAction"
              size="full"
              disabled={loading}
              className="mt-8"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">测试账号：</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>业务员: sales001 / 123456</p>
              <p>业务员: sales002 / 123456</p>
              <p>队长: leader001 / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
