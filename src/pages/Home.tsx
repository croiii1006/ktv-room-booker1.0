import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, LayoutGrid, FileText, CheckSquare, LogOut } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'sales' ? '业务员' : '队长';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-1">
              {roleLabel}
            </span>
            <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">工号: {user?.staffNo}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-3">
        <Button
          variant="mobile"
          size="full"
          onClick={() => navigate('/customers')}
          className="justify-start px-5"
        >
          <Users className="w-6 h-6 mr-3 text-primary" />
          我的客户
        </Button>

        <Button
          variant="mobile"
          size="full"
          onClick={() => navigate('/rooms')}
          className="justify-start px-5"
        >
          <LayoutGrid className="w-6 h-6 mr-3 text-primary" />
          排房情况
        </Button>

        {user?.role === 'sales' ? (
          <Button
            variant="mobile"
            size="full"
            onClick={() => navigate('/orders')}
            className="justify-start px-5"
          >
            <FileText className="w-6 h-6 mr-3 text-primary" />
            订单申请
          </Button>
        ) : (
          <Button
            variant="mobile"
            size="full"
            onClick={() => navigate('/approval')}
            className="justify-start px-5"
          >
            <CheckSquare className="w-6 h-6 mr-3 text-primary" />
            订单审核
          </Button>
        )}
      </main>
    </div>
  );
}
