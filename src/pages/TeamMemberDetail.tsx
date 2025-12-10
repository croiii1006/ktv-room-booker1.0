import React from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamMemberDetail() {
  const { staffNo } = useParams<{ staffNo: string }>();
  const { 
    teamMembers, 
    getCustomersBySalesId, 
    getAllRechargeRequestsBySales,
    getAllConsumptionRequestsBySales,
    getAllBookingsBySales 
  } = useData();

  const member = teamMembers.find((tm) => tm.staffNo === staffNo);
  const customers = getCustomersBySalesId(staffNo || '');
  const rechargeRequests = getAllRechargeRequestsBySales(staffNo || '');
  const consumptionRequests = getAllConsumptionRequestsBySales(staffNo || '');
  const bookings = getAllBookingsBySales(staffNo || '');

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="业务员详情" />
        <div className="p-4 text-center text-muted-foreground">
          业务员不存在
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="业务员详情" />

      <main className="p-4 space-y-4">
        {/* Member Info */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-xl font-bold text-foreground">{member.name}</h2>
          <p className="text-sm text-muted-foreground">工号: {member.staffNo}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="customers">客户名单</TabsTrigger>
            <TabsTrigger value="recharge">充值记录</TabsTrigger>
            <TabsTrigger value="service">服务记录</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-4 space-y-3">
            {customers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无客户</p>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-card rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">¥{customer.balance}</p>
                      <p className="text-xs text-muted-foreground">{customer.cardType}卡</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="recharge" className="mt-4 space-y-3">
            {rechargeRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无充值记录</p>
            ) : (
              rechargeRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{request.customerName}</h3>
                      <p className="text-lg font-bold text-primary">¥{request.amount}</p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">{request.createdAt}</div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="service" className="mt-4 space-y-3">
            {consumptionRequests.length === 0 && bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无服务记录</p>
            ) : (
              <>
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          预订 - {booking.customerName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.date), 'MM/dd EEEE', { locale: zhCN })}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.createdAt}</div>
                  </div>
                ))}
                {consumptionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          服务 - {request.customerName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.date), 'MM/dd EEEE', { locale: zhCN })}
                        </p>
                      </div>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <div className="text-xs text-muted-foreground">{request.createdAt}</div>
                  </div>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
