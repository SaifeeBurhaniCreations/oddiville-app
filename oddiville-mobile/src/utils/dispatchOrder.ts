import { DispatchOrderList, UnparsedDispatchOrders } from '@/src/types';

export const parseOrdersWithDates = (orders: UnparsedDispatchOrders[]): DispatchOrderList => {
    const toDate = (d: any) => (typeof d === 'string' ? new Date(d) : d ?? null);

    return orders.map(value => ({
        ...value,
        dispatch_date: toDate(value.dispatch_date),
        est_delivered_date: toDate(value.est_delivered_date),
        delivered_date: toDate(value.delivered_date)
    }));
};
