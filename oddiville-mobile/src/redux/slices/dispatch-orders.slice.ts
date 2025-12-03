import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const dispatchOrder = [
    // :large_yellow_circle: Order 1: No truck_details, no delieverd_date
    {
        id: '5001',
        status: 'pending',
        customer_name: 'Amit Verma',
        address: '12, MG Road, Delhi – 110001',
        total_quantity: '3',
        unit: 'Ton',
        total_amount: '3',
        dispatch_date: new Date('2025-06-10').toISOString(),
        est_delivered_date: new Date('2025-06-20').toISOString(),
        delivered_date: null,
        product_details: [
            {
                id: '6001',
                name: 'Spinach',
                unit: 'kg',
                amount: '1.2',
                chambers: [
                    { id: '7001', name: 'Green House 1', quantity: '600', unit: 'kg' },
                    { id: '7002', name: 'Green House 2', quantity: '600', unit: 'kg' }
                ],
                packages: [
                    { quantity: 40, size: '10', unit: 'kg' },
                    { quantity: 80, size: '1', unit: 'kg' }
                ]
            },
            {
                id: '6002',
                name: 'Broccoli',
                unit: 'kg',
                amount: '1.8',
                chambers: [
                    { id: '7003', name: 'Zone B', quantity: '900', unit: 'kg' },
                    { id: '7004', name: 'Zone C', quantity: '900', unit: 'kg' }
                ],
                packages: [
                    { quantity: 30, size: '10', unit: 'kg' },
                    { quantity: 90, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: null
    },
    // :white_check_mark: Order 2: Has truck_details and delieverd_date
    {
        id: '5002',
        status: 'completed',
        customer_name: 'Sunita Rao',
        address: '8, Park Avenue, Chennai – 600004',
        total_quantity: '4.5',
        unit: 'Ton',
        total_amount: '4.5',
        dispatch_date: new Date('2025-05-28').toISOString(),
        est_delivered_date: new Date('2025-06-15').toISOString(),
        delivered_date: new Date('2025-06-14').toISOString(),
        product_details: [
            {
                id: '6003',
                name: 'Cucumber',
                unit: 'kg',
                amount: '2',
                chambers: [
                    { id: '7005', name: 'Chamber X', quantity: '1000', unit: 'kg' }
                ],
                packages: [
                    { quantity: 60, size: '10', unit: 'kg' },
                    { quantity: 80, size: '1', unit: 'kg' }
                ]
            },
            {
                id: '6004',
                name: 'Beetroot',
                unit: 'kg',
                amount: '2.5',
                chambers: [
                    { id: '7006', name: 'Chamber Y', quantity: '1250', unit: 'kg' }
                ],
                packages: [
                    { quantity: 50, size: '10', unit: 'kg' },
                    { quantity: 100, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: {
            agency_name: 'SpeedLogix',
            driver_name: 'Mukesh Sharma',
            phone: '9811122233',
            type: 'Open Truck',
            number: 'TN10XY1234',
            challan: 'CHLN-20250624-004'
        }
    },
    // :large_yellow_circle: Order 3: No truck_details, no delieverd_date
    {
        id: '5003',
        status: 'processing',
        customer_name: 'Ravi Shetty',
        address: '77, Palm Street, Kochi – 682001',
        total_quantity: '2.2',
        unit: 'Ton',
        total_amount: '2.2',
        dispatch_date: new Date('2025-06-12').toISOString(),
        est_delivered_date: new Date('2025-06-22').toISOString(),
        delivered_date: null,
        product_details: [
            {
                id: '6005',
                name: 'Pumpkin',
                unit: 'kg',
                amount: '1.2',
                chambers: [
                    { id: '7007', name: 'Block A', quantity: '600', unit: 'kg' }
                ],
                packages: [
                    { quantity: 40, size: '10', unit: 'kg' },
                    { quantity: 80, size: '500', unit: 'gm' }
                ]
            },
            {
                id: '6006',
                name: 'Zucchini',
                unit: 'kg',
                amount: '1',
                chambers: [
                    { id: '7008', name: 'Block B', quantity: '500', unit: 'kg' }
                ],
                packages: [
                    { quantity: 25, size: '10', unit: 'kg' },
                    { quantity: 50, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: null
    },
    // :white_check_mark: Order 4: Has truck_details and delieverd_date
    {
        id: '5004',
        status: 'completed',
        customer_name: 'Nisha Kapoor',
        address: '23, Riverdale, Mumbai – 400050',
        total_quantity: '4',
        unit: 'Ton',
        total_amount: '4',
        dispatch_date: new Date('2025-05-18').toISOString(),
        est_delivered_date: new Date('2025-06-01').toISOString(),
        delivered_date: new Date('2025-06-01').toISOString(),
        product_details: [
            {
                id: '6007',
                name: 'Peas',
                unit: 'kg',
                amount: '2',
                chambers: [
                    { id: '7009', name: 'Cooler 1', quantity: '1000', unit: 'kg' }
                ],
                packages: [
                    { quantity: 40, size: '10', unit: 'kg' },
                    { quantity: 120, size: '1', unit: 'kg' }
                ]
            },
            {
                id: '6008',
                name: 'Sweet Corn',
                unit: 'kg',
                amount: '2',
                chambers: [
                    { id: '7010', name: 'Cooler 2', quantity: '1000', unit: 'kg' }
                ],
                packages: [
                    { quantity: 30, size: '10', unit: 'kg' },
                    { quantity: 140, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: {
            agency_name: 'South Cargo',
            driver_name: 'Ashok Tiwari',
            phone: '9844567890',
            type: 'Mini Truck',
            number: 'MH20RT9087',
            challan: 'CHLN-20250624-005'
        }
    },
    // :white_check_mark: Order 5: Has truck_details and delieverd_date
    {
        id: '5005',
        status: 'completed',
        customer_name: 'Priya Singh',
        address: '91, Residency Road, Jaipur – 302001',
        total_quantity: '3.2',
        unit: 'Ton',
        total_amount: '3.2',
        dispatch_date: new Date('2025-05-25').toISOString(),
        est_delivered_date: new Date('2025-06-05').toISOString(),
        delivered_date: new Date('2025-06-04').toISOString(),
        product_details: [
            {
                id: '6009',
                name: 'Turnip',
                unit: 'kg',
                amount: '1.7',
                chambers: [
                    { id: '7011', name: 'Zone 4', quantity: '850', unit: 'kg' }
                ],
                packages: [
                    { quantity: 25, size: '10', unit: 'kg' },
                    { quantity: 70, size: '1', unit: 'kg' }
                ]
            },
            {
                id: '6010',
                name: 'Radish',
                unit: 'kg',
                amount: '1.5',
                chambers: [
                    { id: '7012', name: 'Zone 5', quantity: '750', unit: 'kg' }
                ],
                packages: [
                    { quantity: 20, size: '10', unit: 'kg' },
                    { quantity: 80, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: {
            agency_name: 'Jaipur Haulers',
            driver_name: 'Devendra Joshi',
            phone: '9821456732',
            type: 'Open Truck',
            number: 'RJ14ZX1234',
            challan: 'CHLN-20250624-006'
        }
    },
    // :large_yellow_circle: Order 6: No truck_details, no delieverd_date
    {
        id: '5006',
        status: 'pending',
        customer_name: 'Deepak Nair',
        address: 'House 33, Sector 9, Chandigarh – 160009',
        total_quantity: '2.5',
        unit: 'Ton',
        total_amount: '2.5',
        dispatch_date: new Date('2025-06-17').toISOString(),
        est_delivered_date: new Date('2025-06-26').toISOString(),
        delivered_date: null,
        product_details: [
            {
                id: '6011',
                name: 'Green Beans',
                unit: 'kg',
                amount: '1.2',
                chambers: [
                    { id: '7013', name: 'Store A', quantity: '600', unit: 'kg' }
                ],
                packages: [
                    { quantity: 20, size: '10', unit: 'kg' },
                    { quantity: 60, size: '1', unit: 'kg' }
                ]
            },
            {
                id: '6012',
                name: 'Bitter Gourd',
                unit: 'kg',
                amount: '1.3',
                chambers: [
                    { id: '7014', name: 'Store B', quantity: '650', unit: 'kg' }
                ],
                packages: [
                    { quantity: 20, size: '10', unit: 'kg' },
                    { quantity: 70, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: null
    },
    // :white_check_mark: Order 7: Has truck_details but no delieverd_date
    {
        id: '5007',
        status: 'processing',
        customer_name: 'Kiran Das',
        address: 'Hilltop Colony, Shillong – 793001',
        total_quantity: '3.7',
        unit: 'Ton',
        total_amount: '3.7',
        dispatch_date: new Date('2025-06-20').toISOString(),
        est_delivered_date: new Date('2025-06-28').toISOString(),
        delivered_date: null,
        product_details: [
            {
                id: '6013',
                name: 'Bottle Gourd',
                unit: 'kg',
                amount: '3.7',
                chambers: [
                    { id: '7015', name: 'Main Cooler', quantity: '1850', unit: 'kg' }
                ],
                packages: [
                    { quantity: 60, size: '10', unit: 'kg' },
                    { quantity: 100, size: '1', unit: 'kg' }
                ]
            }
        ],
        truck_details: {
            agency_name: 'Northeast Cargo',
            driver_name: 'Prakash Das',
            phone: '9856543210',
            type: 'Mini Truck',
            number: 'ML05AB1234',
            challan: 'CHLN-20250624-007'
        }
    }
];


const DispatchOrdersSlice = createSlice({
    name: "vendors data",
    initialState: dispatchOrder,
    reducers: {
        selectUnie: (state, action) => {

        },
    },
});

export const { selectUnie } = DispatchOrdersSlice.actions;
export default DispatchOrdersSlice.reducer;
