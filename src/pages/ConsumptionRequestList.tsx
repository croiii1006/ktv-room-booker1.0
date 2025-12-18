import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { ConsumptionDetailDialog } from '@/components/ConsumptionDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useConsumeList } from '@/queries/consume-queries';
import { MemberNameDisplay } from '@/components/MemberNameDisplay';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';

export default function ConsumptionRequestList() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: consumeData, isLoading } = useConsumeList();
  const requests = consumeData?.data?.data?.list || [];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="消费申请" />

      <main className="p-4 space-y-3">
        {isLoading ? (
             <div className="text-center py-12">
             <p className="text-muted-foreground">加载中...</p>
           </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无消费确认申请记录</p>
          </div>
        ) : (
          requests.map((request) => {
            const roomDisplay = request.roomNo ? `${request.roomNo} - ${request.roomName}` : (request.roomName || '未知房间');
            const dateDisplay = request.reserveDate ? format(new Date(request.reserveDate), 'MM/dd EEEE', { locale: zhCN }) : '-';

            return (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id?.toString() || '')}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                     {request.storeName && <span className="mr-2 text-sm text-muted-foreground">[{request.storeName}]</span>}
                    {roomDisplay} 
                    <span className="ml-2">
                        <MemberNameDisplay id={request.memberId?.toString()} initialName={request.memberName} />
                    </span>
                  </h3>
                  <div className="text-sm text-muted-foreground mt-0.5 space-y-1">
                      {request.consumeNo && <p>单号: {request.consumeNo}</p>}
                      <p>{dateDisplay}</p>
                  </div>
                </div>
                <RequestStatusBadge status={request.status || 'PENDING'} />
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                <span>
                    服务业务员: <StaffNameDisplay id={request.applyStaffId?.toString()} />
                </span>
                {request.consumeAmount !== undefined && (
                    <span className="font-medium text-foreground">¥{request.consumeAmount}</span>
                )}
              </div>
            </div>
          )})
        )}
      </main>

      <ConsumptionDetailDialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        requestId={selectedId || ''}
        roomName={requests.find(r => r.id?.toString() === selectedId)?.roomName}
        roomNo={requests.find(r => r.id?.toString() === selectedId)?.roomNo}
        showActions={false}
      />
    </div>
  );
}
