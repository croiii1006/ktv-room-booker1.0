import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(true);
  const [rememberPassword, setRememberPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedRememberAcc = localStorage.getItem('ktv_remember_account');
    const savedRememberPwd = localStorage.getItem('ktv_remember_password');
    const rememberAccEnabled = savedRememberAcc === null ? true : savedRememberAcc === '1';
    const rememberPwdEnabled = savedRememberPwd === '1';
    setRememberAccount(rememberAccEnabled);
    setRememberPassword(rememberPwdEnabled);
    if (rememberAccEnabled) {
      const savedAcc = localStorage.getItem('ktv_saved_account') || '';
      if (savedAcc) setAccount(savedAcc);
    }
    if (rememberPwdEnabled) {
      const savedPwd = localStorage.getItem('ktv_saved_password') || '';
      if (savedPwd) setPassword(savedPwd);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account.trim() || !password.trim()) {
      toast.error('请输入账号和密码');
      return;
    }

    localStorage.setItem('ktv_remember_account', rememberAccount ? '1' : '0');
    localStorage.setItem('ktv_remember_password', rememberPassword ? '1' : '0');
    if (rememberAccount) {
      localStorage.setItem('ktv_saved_account', account);
    } else {
      localStorage.removeItem('ktv_saved_account');
    }
    if (rememberPassword) {
      localStorage.setItem('ktv_saved_password', password);
    } else {
      localStorage.removeItem('ktv_saved_password');
    }

    setLoading(true);
    
    try {
      const success = await login(account, password);
      if (success) {
        toast.success('登录成功');
        navigate('/home');
      } else {
        // toast.error('账号或密码错误'); // AuthContext already handles error toasts
      }
    } catch (error) {
      // toast.error('登录失败，请检查网络'); // AuthContext already handles error toasts
    } finally {
      setLoading(false);
    }
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

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={rememberAccount}
                  onCheckedChange={(v) => {
                    const val = !!v;
                    setRememberAccount(val);
                    localStorage.setItem('ktv_remember_account', val ? '1' : '0');
                    if (!val) {
                      localStorage.removeItem('ktv_saved_account');
                    } else if (account) {
                      localStorage.setItem('ktv_saved_account', account);
                    }
                  }}
                />
                记住用户名
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={rememberPassword}
                  onCheckedChange={(v) => {
                    const val = !!v;
                    setRememberPassword(val);
                    localStorage.setItem('ktv_remember_password', val ? '1' : '0');
                    if (!val) {
                      localStorage.removeItem('ktv_saved_password');
                    } else if (password) {
                      localStorage.setItem('ktv_saved_password', password);
                    }
                  }}
                />
                记住密码
              </label>
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
              <p>队长: teamleader1 / 123456</p>
              <p>队长: teamleader2 / 123456</p>
              <p>业务员: salesman1 / 123456</p>
              <p>业务员: salesman2 / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
