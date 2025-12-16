export interface AdminDirectReservationReq {
    storeId: number;
    roomId: number;
    memberId: number;
    staffId?: number;
    reserveDate: string;
    guestCount?: number;
    remark?: string;
}
