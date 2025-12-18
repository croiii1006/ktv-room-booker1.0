import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDetailDialog } from "@/components/BookingDetailDialog";
import { ConsumptionDetailDialog } from "@/components/ConsumptionDetailDialog";
import { RechargeDetailDialog } from "@/components/RechargeDetailDialog";
import { useTeamMemberDetail, useTeamMemberReservations, useTeamMemberRecharges, useTeamMemberConsumes, useTeamList } from "@/queries/team-queries";
import { useMemberList } from "@/queries/member-queries";
import { useRoomSchedule } from "@/queries/common-queries";
import { MemberNameDisplay } from "@/components/MemberNameDisplay";

type DetailType = "customer" | "recharge" | "service" | "booking";

interface SelectedItem {
  type: DetailType;
  data: any;
}

export default function TeamMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const staffId = parseInt(id || '0');
  
  const { data: memberDetail, isLoading: isLoadingMember } = useTeamMemberDetail(staffId);
  // memberDetail.data.data is H5TeamStaffResp
  const member = memberDetail?.data?.data;

  // We need to fetch lists for this specific staff member
  // Note: member-queries typically fetch "my members". If we need "members by staff", we might need a new query or filter.
  // Assuming useMemberList returns all members for leader or filtered by backend context? 
  // Actually the original code had getCustomersBySalesId.
  // Let's assume for now we don't have a specific API to get customers by another staff ID easily exposed in h5-api.ts 
  // OR we can try to use useMemberList and filter client side if the API returns all.
  // Checking h5-api.ts: myMembers() returns ResultH5MemberResp. It might be only "my" members.
  // If the backend `myMembers` supports a staffId param (it doesn't seem to based on generated code), we might be limited.
  // HOWEVER, looking at h5-api.ts, `myMembers` takes page, size, keyword. 
  // If we can't get customers by staffId, we might skip this tab or show empty for now, or assume leader sees all.
  // Let's try useMemberList() and see if it works for leader (returning all).
  const { data: membersData } = useMemberList(1, 100, undefined, { enabled: false }); 
  const allCustomers = membersData?.data?.data?.list || [];
  // Filter customers that belong to this staff - assuming the response contains salesId/staffId
  const customers = allCustomers.filter((c: any) => c.staffId === staffId || c.salesId === staffId);
  
  // Get all staffs to map staff names
  const { data: teamData } = useTeamList(1, 100);
  const allStaffs = teamData?.data?.data?.list || [];

  // Get room list for mapping room names
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: scheduleData } = useRoomSchedule(todayStr, todayStr, user?.storeId);
  const rooms = scheduleData?.data?.data?.rooms || [];
  const getRoomInfo = (roomId: number) => {
    const room = rooms.find((r: any) => r.id === roomId);
    return room ? `${room.roomType || ''} ${room.roomNo || ''}` : `房间ID:${roomId}`;
  };

  const resolveNameFromList = (item: any) => {
    return undefined;
  };

  const { data: rechargesData, isLoading: isLoadingRecharges } = useTeamMemberRecharges(staffId, 1, 100);
  const rechargeRequests = rechargesData?.data?.data?.list || [];

  const { data: consumesData, isLoading: isLoadingConsumes } = useTeamMemberConsumes(staffId, 1, 100);
  const consumptionRequests = consumesData?.data?.data?.list || [];

  const { data: bookingsData, isLoading: isLoadingBookings } = useTeamMemberReservations(staffId, 1, 100);
  const bookings = bookingsData?.data?.data?.list || [];

  const [selected, setSelected] = useState<SelectedItem | null>(null);

  if (isLoadingMember) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="业务员详情" />
        <div className="p-4 text-center text-muted-foreground">
          业务员不存在 (ID: {id})
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
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-xl font-bold text-foreground">{member.name}</h2>
                <p className="text-sm text-muted-foreground">手机: {member.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">ID: {member.id}</span>
                  <span className="text-xs text-muted-foreground">门店: {member.storeName || member.storeId}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-muted-foreground">加入时间: {member.createdAt ? format(new Date(member.createdAt), 'yyyy-MM-dd') : '-'}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Tabs */}
          <Tabs defaultValue="recharge" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              {/* <TabsTrigger value="customers">客户名单</TabsTrigger> */}
              <TabsTrigger value="recharge">充值记录</TabsTrigger>
              <TabsTrigger value="booking">预定记录</TabsTrigger>
              <TabsTrigger value="service">服务记录</TabsTrigger>
            </TabsList>

          {/* 客户名单 */}
          {/* <TabsContent value="customers" className="mt-4 space-y-3">
            {customers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无客户</p>
            ) : (
              customers.map((customer: any) => (
                <div
                  key={customer.id}
                  className="bg-card rounded-lg border border-border p-4 cursor-pointer active:bg-accent"
                  onClick={() =>
                    setSelected({ type: "customer", data: customer })
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        ¥{customer.balance}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.cardTypeName || customer.cardType}卡
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent> */}

          {/* 充值记录 */}
          <TabsContent value="recharge" className="mt-4 space-y-3">
            {isLoadingRecharges ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : rechargeRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                暂无充值记录
              </p>
            ) : (
              rechargeRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card rounded-lg border border-border p-4 cursor-pointer active:bg-accent"
                  onClick={() =>
                    setSelected({ type: "recharge", data: request })
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        充值 - <MemberNameDisplay id={request.memberId || request.customerId} initialName={resolveNameFromList(request)} />
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        ¥{request.amount}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status || 'PENDING'} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* 预定记录 */}
          <TabsContent value="booking" className="mt-4 space-y-3">
            {isLoadingBookings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                暂无预定记录
              </p>
            ) : (
              bookings.map((booking) => {
                const dateStr = booking.reserveDate || booking.arrivalTime;
                return (
                <div
                  key={booking.id}
                  className="bg-card rounded-lg border border-border p-4 cursor-pointer active:bg-accent"
                  onClick={() =>
                    setSelected({ type: "booking", data: booking })
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        预定 - <MemberNameDisplay id={booking.memberId || booking.customerId} initialName={resolveNameFromList(booking)} />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dateStr ? format(new Date(dateStr), "MM/dd EEEE", {
                          locale: zhCN,
                        }) : '-'}
                      </p>
                    </div>
                    <StatusBadge status={booking.status || 'PENDING'} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.createdAt ? format(new Date(booking.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                  </div>
                </div>
              )
              })
            )}
          </TabsContent>

          {/* 服务记录：消费确认 */}
          <TabsContent value="service" className="mt-4 space-y-3">
            {isLoadingConsumes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : consumptionRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                暂无服务记录
              </p>
            ) : (
              consumptionRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card rounded-lg border border-border p-4 cursor-pointer active:bg-accent"
                  onClick={() =>
                    setSelected({ type: "service", data: request })
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {getRoomInfo(request.roomId)} - <MemberNameDisplay id={request.memberId || request.customerId} initialName={resolveNameFromList(request)} />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.bookingDate ? format(new Date(request.bookingDate), "MM/dd EEEE", {
                          locale: zhCN,
                        }) : (request.createdAt ? format(new Date(request.createdAt), "MM/dd EEEE", {
                          locale: zhCN,
                        }) : '-')}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status || 'PENDING'} />
                  </div>
                  <div className="flex justify-end items-center text-xs mt-2">
                    <span className="font-bold text-primary">
                      ¥{request.consumeAmount}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Detail Dialogs */}
      <RechargeDetailDialog
        open={selected?.type === 'recharge'}
        onClose={() => setSelected(null)}
        requestId={selected?.type === 'recharge' ? selected.data.id?.toString() : ''}
        showActions={true}
      />

      <BookingDetailDialog
        open={selected?.type === 'booking'}
        onOpenChange={(open) => !open && setSelected(null)}
        bookingId={selected?.type === 'booking' ? selected.data.id?.toString() : null}
        isReviewMode={true}
      />

      <ConsumptionDetailDialog
        open={selected?.type === 'service'}
        onOpenChange={(open) => !open && setSelected(null)}
        requestId={selected?.type === 'service' ? selected.data.id?.toString() : ''}
        showActions={true}
      />
    </div>
  );
}
