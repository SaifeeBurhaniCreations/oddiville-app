import { UnparsedVendor, Vendor } from '@/src/types';

export const parseVendorsWithDates = (vendors: UnparsedVendor[]): Vendor[] => {
    const toDate = (d: any) => (typeof d === 'string' ? new Date(d) : d ?? null);

    return vendors.map(vendor => ({
        ...vendor,
        orders: vendor.orders?.map(order => ({
            ...order, 
            order_date: toDate(order.order_date),
            arrival_date: toDate(order.arrival_date),
            est_arrival_date: toDate(order.est_arrival_date),
        })) || [],
    }));
};
