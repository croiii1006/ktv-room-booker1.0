export interface AdminDirectReservationReq {
    storeId: string;
    roomId: string;
    memberId: string;
    staffId?: string;
    reserveDate: string;
    guestCount?: number;
    remark?: string;
}
