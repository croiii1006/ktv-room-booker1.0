import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { ConsumptionDetailDialog } from '@/components/ConsumptionDetailDialog';
import { useAuth } from '@/contexts/AuthContext';

// 从 localStorage 读取最新的消费确认申请，避免 Context 状态不同步的问题
function getVisibleRequestsFromStorage(leaderId: string) {
  if (!leaderId) return [];

  const saved = localStorage.getItem('ktv_data_v2');
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as {
      consumptionRequests?: any[];
    };

    const all = parsed.consumptionRequests || [];

    const visible = all
      .filter(
        (r) =>
          r.leaderId === leaderId &&
          r.status === 'pending' // 只要待审核的
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    console.log('[ConsumptionApproval] 可见待审核列表 =', visible);
    return visible;
  } catch (e) {
    console.error('[ConsumptionApproval] 解析 ktv_data_v2 出错', e);
    return [];
  }
}

export default function ConsumptionApproval() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 只允许队长查看
  if (!user || user.role !== 'leader') {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="确认消费申请审核" />
        <main className="p-4">
          <p className="text-muted-foreground text-sm">仅队长可查看消费确认申请。</p>
        </main>
      </div>
    );
  }

  const leaderId = user.staffNo;
  // 🔥 每次渲染都从 localStorage 读一遍最新的待审核列表
  const visibleRequests = getVisibleRequestsFromStorage(leaderId);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="确认消费申请审核" />

      <main className="p-4 space-y-3">
        {visibleRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核消费确认申请</p>
          </div>
        ) : (
          visibleRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id)}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {request.roomName}房 - {request.customerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(new Date(request.date), 'MM/dd EEEE', { locale: zhCN })}
                  </p>
                </div>
                {/* 状态完全跟随当前记录的 status */}
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>服务业务员: {request.serviceSalesName}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                预定业务员: {request.bookingSalesName}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt}
              </div>
            </div>
          ))
        )}
      </main>

      <ConsumptionDetailDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        requestId={selectedId || ''}
        showActions={true}
      />
    </div>
  );
}
