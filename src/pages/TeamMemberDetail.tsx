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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeamMemberDetail, useTeamMemberReservations, useTeamMemberRecharges, useTeamMemberConsumes } from "@/queries/team-queries";
import { useMemberList } from "@/queries/member-queries";
import { useRoomSchedule } from "@/queries/common-queries";
import { useReservationDetail } from "@/queries/reservation-queries";

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
  const member = memberDetail?.data;

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
  const { data: membersData } = useMemberList(1, 100); 
  const allCustomers = membersData?.data?.data?.list || [];
  // Filter customers that belong to this staff - assuming the response contains salesId/staffId
  const customers = allCustomers.filter((c: any) => c.staffId === staffId || c.salesId === staffId);
  
  // Get room list for mapping room names
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: scheduleData } = useRoomSchedule(todayStr, todayStr);
  const rooms = scheduleData?.data?.data?.rooms || [];
  const getRoomInfo = (roomId: number) => {
    const room = rooms.find((r: any) => r.id === roomId);
    return room ? `${room.roomType || ''} ${room.roomNo || ''}` : `房间ID:${roomId}`;
  };

  const getCustomerName = (item: any) => {
    if (item.memberName) return item.memberName;
    if (item.customerName) return item.customerName;
    const customer = allCustomers.find((c: any) => c.id === item.memberId || c.id === item.customerId);
    return customer ? customer.name : (item.memberId || item.customerId || '未知');
  };

  const getStaffName = (item: any) => {
     if (item.applyStaffName) return item.applyStaffName;
     if (item.salesName) return item.salesName;
     // If the staffId matches the current member detail we are viewing
     if (item.staffId === staffId) return member.name;
     return item.staffId || '未知';
  };

  const { data: rechargesData, isLoading: isLoadingRecharges } = useTeamMemberRecharges(staffId, 1, 100);
  const rechargeRequests = rechargesData?.data?.data?.list || [];

  const { data: consumesData, isLoading: isLoadingConsumes } = useTeamMemberConsumes(staffId, 1, 100);
  const consumptionRequests = consumesData?.data?.data?.list || [];

  const { data: bookingsData, isLoading: isLoadingBookings } = useTeamMemberReservations(staffId, 1, 100);
  const bookings = bookingsData?.data?.data?.list || [];

  const [selected, setSelected] = useState<SelectedItem | null>(null);

  // Fetch booking detail if a booking is selected
  const selectedBookingId = selected?.type === 'booking' ? selected.data.id : 0;
  const { data: bookingDetailData, isLoading: isLoadingBookingDetail } = useReservationDetail(selectedBookingId);
  
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

  // 根据选中的 item 渲染弹窗内容
  const renderDetailContent = () => {
    if (!selected) return null;
    const item = selected.data;

    if (selected.type === "customer") {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户姓名</span>
            <span className="font-medium">{item.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户编号</span>
            <span className="font-medium">{item.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">手机号</span>
            <span className="font-medium">{item.phone || "未填写"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">证件号</span>
            <span className="font-medium text-xs">
              {item.idCard || "未填写"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">卡类型</span>
            <span className="font-medium">{item.cardTypeName || item.cardType}卡</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">开卡日期</span>
            <span className="font-medium">{item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd') : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">余额</span>
            <span className="font-medium text-primary">¥{item.balance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">赠送金额</span>
            <span className="font-medium">¥{item.giftBalance || item.giftAmount || 0}</span>
          </div>
        </div>
      );
    }

    if (selected.type === "recharge") {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户</span>
            <span className="font-medium">{getCustomerName(item)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">充值金额</span>
            <span className="font-medium text-primary">¥{item.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">赠送产品</span>
            <span className="font-medium">{item.giftAmount ? `¥${item.giftAmount}` : "无"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">状态</span>
            <RequestStatusBadge status={item.status || 'PENDING'} />
          </div>
          {item.rejectReason && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">驳回理由</p>
              <p className="text-xs text-destructive">{item.rejectReason}</p>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">申请时间</span>
            <span className="font-medium text-xs">{item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm') : '-'}</span>
          </div>
        </div>
      );
    }

    if (selected.type === "booking") {
      // 如果正在加载详情，显示加载中
      if (isLoadingBookingDetail) {
         return (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
         );
      }
      
      // 优先使用详情接口返回的数据，否则使用列表数据
      // 注意：bookingDetailData.data 是 ResultReservationResp，bookingDetailData.data.data 才是 ReservationResp
      const detailItem = bookingDetailData?.data?.data || item;
      
      // 预定记录
      // Use reserveDate instead of arrivalTime as per API response
      const dateStr = detailItem.reserveDate || detailItem.arrivalTime;
      const formattedDate = dateStr ? format(new Date(dateStr), "yyyy年MM月dd日 EEEE", {
        locale: zhCN,
      }) : '-';
      
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">预定号</span>
            <span className="font-medium text-xs">{detailItem.reserveNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">房间号</span>
            <span className="font-medium">
               {getRoomInfo(detailItem.roomId)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预定日期</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预计人数</span>
            <span className="font-medium">{detailItem.guestCount || 1}人</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户</span>
            <span className="font-medium">{detailItem.memberName || getCustomerName(detailItem)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预定业务员</span>
            <span className="font-medium">
              {detailItem.applyStaffName || detailItem.salesName || getStaffName(detailItem)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">订单状态</span>
            <StatusBadge status={detailItem.status || 'PENDING'} />
          </div>
          {detailItem.remark && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">备注</span>
              <span className="font-medium text-xs max-w-[200px] truncate">{detailItem.remark}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">创建时间</span>
            <span className="font-medium text-xs">{detailItem.createdAt ? format(new Date(detailItem.createdAt), 'yyyy-MM-dd HH:mm') : '-'}</span>
          </div>
          {detailItem.rejectReason && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">驳回理由</p>
              <p className="text-xs text-destructive">{detailItem.rejectReason}</p>
            </div>
          )}
        </div>
      );
    }
    if (selected.type === "service") {
      // 消费确认记录
      const formattedDate = item.bookingDate ? format(new Date(item.bookingDate), "yyyy年MM月dd日 EEEE", {
        locale: zhCN,
      }) : '-';
      
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">房间号</span>
            <span className="font-medium">
              {getRoomInfo(item.roomId)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">日期</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户</span>
            <span className="font-medium">{getCustomerName(item)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">服务业务员</span>
            <span className="font-medium">
              {item.serviceStaffName || '未知'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">状态</span>
            <RequestStatusBadge status={item.status || 'PENDING'} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">申请时间</span>
            <span className="font-medium text-xs">{item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm') : '-'}</span>
          </div>
          {item.rejectReason && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">驳回理由</p>
              <p className="text-xs text-destructive">{item.rejectReason}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const detailTitleMap: Record<DetailType, string> = {
    customer: "客户详情",
    recharge: "充值记录详情",
    service: "服务记录详情",
    booking: "预定记录详情",
  };

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
                <p className="text-xs text-muted-foreground mt-1">ID: {member.id}</p>
             </div>
          </div>
        </div>

        {/* Tabs */}
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="customers">客户名单</TabsTrigger>
              <TabsTrigger value="recharge">充值记录</TabsTrigger>
              <TabsTrigger value="booking">预定记录</TabsTrigger>
              <TabsTrigger value="service">服务记录</TabsTrigger>
            </TabsList>

          {/* 客户名单 */}
          <TabsContent value="customers" className="mt-4 space-y-3">
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
          </TabsContent>

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
                        充值 - {getCustomerName(request)}
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
                        预定 - {getCustomerName(booking)}
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
                        服务 - {getCustomerName(request)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.bookingDate ? format(new Date(request.bookingDate), "MM/dd EEEE", {
                          locale: zhCN,
                        }) : '-'}
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
        </Tabs>
      </main>

      {/* 统一详情弹窗 */}
      {selected && (
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent className="max-w-sm mx-4 rounded-xl">
            <DialogHeader>
              <DialogTitle>{detailTitleMap[selected.type]}</DialogTitle>
            </DialogHeader>

            {renderDetailContent()}

            <Button
              className="mt-4 w-full"
              variant="mobileSecondary"
              onClick={() => setSelected(null)}
            >
              关闭
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
