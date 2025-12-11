import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DetailType = "customer" | "recharge" | "service" | "consumption";

interface SelectedItem {
  type: DetailType;
  data: any;
}

export default function TeamMemberDetail() {
  const { staffNo } = useParams<{ staffNo: string }>();
  const {
    teamMembers,
    rooms,
    getCustomersBySalesId,
    getAllRechargeRequestsBySales,
    getAllConsumptionRequestsBySales,
    getAllBookingsBySales,
  } = useData();

  const member = teamMembers.find((tm) => tm.staffNo === staffNo);
  const customers = getCustomersBySalesId(staffNo || "");
  const rechargeRequests = getAllRechargeRequestsBySales(staffNo || "");
  const consumptionRequests = getAllConsumptionRequestsBySales(staffNo || "");
  const bookings = getAllBookingsBySales(staffNo || "");

  const [selected, setSelected] = useState<SelectedItem | null>(null);

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
            <span className="font-medium">{item.cardType}卡</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">开卡日期</span>
            <span className="font-medium">{item.openDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">余额</span>
            <span className="font-medium text-primary">¥{item.balance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">赠送金额</span>
            <span className="font-medium">¥{item.giftAmount}</span>
          </div>
        </div>
      );
    }

    if (selected.type === "recharge") {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户</span>
            <span className="font-medium">{item.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">充值金额</span>
            <span className="font-medium text-primary">¥{item.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">赠送产品</span>
            <span className="font-medium">{item.giftProduct || "无"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">状态</span>
            <span className="font-medium">{item.status}</span>
          </div>
          {item.rejectReason && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">驳回理由</p>
              <p className="text-xs text-destructive">{item.rejectReason}</p>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">申请时间</span>
            <span className="font-medium text-xs">{item.createdAt}</span>
          </div>
        </div>
      );
    }

    if (selected.type === "service") {
      // 消费确认记录（service 视角）
      const formattedDate = format(new Date(item.date), "yyyy年MM月dd日 EEEE", {
        locale: zhCN,
      });
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">房间号</span>
            <span className="font-medium">{item.roomName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">日期</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户</span>
            <span className="font-medium">{item.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预定业务员</span>
            <span className="font-medium">{item.bookingSalesName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">服务业务员</span>
            <span className="font-medium">
              {item.serviceSalesName} ({item.serviceSalesStaffNo})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">状态</span>
            <span className="font-medium">{item.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">申请时间</span>
            <span className="font-medium text-xs">{item.createdAt}</span>
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

    if (selected.type === "consumption") {
      // 订房记录 / 消费记录
      const formattedDate = format(new Date(item.date), "yyyy年MM月dd日 EEEE", {
        locale: zhCN,
      });
      const room = rooms.find((r) => r.id === item.roomId);
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">房间号</span>
            <span className="font-medium">{room?.name || item.roomId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预定日期</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">客户</span>
            <span className="font-medium">{item.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">价格</span>
            <span className="font-medium text-primary">¥{item.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预定业务员</span>
            <span className="font-medium">
              {item.salesName} ({item.salesStaffNo})
            </span>
          </div>
          {item.serviceSalesName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">服务业务员</span>
              <span className="font-medium">
                {item.serviceSalesName} ({item.serviceSalesStaffNo})
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">订单状态</span>
            <span className="font-medium">{item.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">创建时间</span>
            <span className="font-medium text-xs">{item.createdAt}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const detailTitleMap: Record<DetailType, string> = {
    customer: "客户详情",
    recharge: "充值记录详情",
    service: "服务记录详情",
    consumption: "消费记录详情",
  };

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
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="customers">客户名单</TabsTrigger>
            <TabsTrigger value="recharge">充值记录</TabsTrigger>
            <TabsTrigger value="service">服务记录</TabsTrigger>
            <TabsTrigger value="consumption">消费记录</TabsTrigger>
          </TabsList>

          {/* 客户名单 */}
          <TabsContent value="customers" className="mt-4 space-y-3">
            {customers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无客户</p>
            ) : (
              customers.map((customer) => (
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
                        {customer.cardType}卡
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* 充值记录 */}
          <TabsContent value="recharge" className="mt-4 space-y-3">
            {rechargeRequests.length === 0 ? (
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
                        {request.customerName}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        ¥{request.amount}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.createdAt}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* 服务记录：消费确认 */}
          <TabsContent value="service" className="mt-4 space-y-3">
            {consumptionRequests.length === 0 ? (
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
                        服务 - {request.customerName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.date), "MM/dd EEEE", {
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.createdAt}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* 消费记录：订房记录 */}
          <TabsContent value="consumption" className="mt-4 space-y-3">
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                暂无消费记录
              </p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-card rounded-lg border border-border p-4 cursor-pointer active:bg-accent"
                  onClick={() =>
                    setSelected({ type: "consumption", data: booking })
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        预订 - {booking.customerName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.date), "MM/dd EEEE", {
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.createdAt}
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
