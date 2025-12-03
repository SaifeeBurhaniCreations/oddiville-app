import { createSlice } from "@reduxjs/toolkit";

const vendors = [
    {
        id: '786546',
        name: 'Rajesh Sharma',
        phone: '8602378564',
        state: 'Maharashtra',
        city: 'Pune',
        zipcode: '452006',
        address: '18, Commercial Street, Banglore - 560001',
        materials: ['carrot', 'okra', 'beans', 'potato', 'cabbage'],
        orders: [
            {
                id: '764856',
                raw_material_name: 'carrot',
                order_date: new Date('2025-05-23').toISOString(),
                arrival_date: new Date('2025-06-13').toISOString(),
                est_arrival_date: new Date('2025-06-12').toISOString(),
                quantity: 2000,
                unit: 'kg',
                price: 300000,
                truck_detail: {
                    gross_weight: 28520,
                    tare_weight: 12430,
                    net_weight: 16090,
                },
            },
        ],
    },
    {
        id: '786547',
        name: 'Pooja Verma',
        phone: '9876543210',
        state: 'Uttar Pradesh',
        city: 'Lucknow',
        zipcode: '226010',
        address: '22, Gomti Nagar, Lucknow - 226010',
        materials: ['onion', 'garlic', 'ginger'],
        orders: [
            {
                id: '764857',
                raw_material_name: 'onion',
                order_date: new Date('2025-06-16').toISOString(),
                arrival_date: new Date('2025-06-19').toISOString(),
                est_arrival_date: new Date('2025-06-18').toISOString(),
                quantity: 1500,
                unit: 'kg',
                price: 180000,
                truck_detail: {
                    gross_weight: 26500,
                    tare_weight: 12000,
                    net_weight: 14500,
                },
            },
            {
                id: '764858',
                raw_material_name: 'potato',
                order_date: new Date('2025-06-12').toISOString(),
                arrival_date: new Date('2025-06-15').toISOString(),
                est_arrival_date: new Date('2025-06-14').toISOString(),
                quantity: 800,
                unit: 'kg',
                price: 100000,
                truck_detail: {
                    gross_weight: 18000,
                    tare_weight: 9000,
                    net_weight: 9000,
                },
            },
        ],
    },
    {
        id: '786548',
        name: 'Manoj Desai',
        phone: '9123456780',
        state: 'Gujarat',
        city: 'Ahmedabad',
        zipcode: '380001',
        address: 'Block C, Naroda GIDC, Ahmedabad - 380001',
        materials: ['tomato', 'capsicum', 'chili'],
        orders: [
            {
                id: '764859',
                raw_material_name: 'tomato',
                order_date: new Date('2025-06-10').toISOString(),
                arrival_date: new Date('2025-06-13').toISOString(),
                est_arrival_date: new Date('2025-06-12').toISOString(),
                quantity: 1000,
                unit: 'kg',
                price: 120000,
                truck_detail: {
                    gross_weight: 23000,
                    tare_weight: 10000,
                    net_weight: 13000,
                },
            },
        ],
    },
    {
        id: '786549',
        name: 'Anita Mehra',
        phone: '9988776655',
        state: 'Rajasthan',
        city: 'Jaipur',
        zipcode: '302001',
        address: '50, MI Road, Jaipur - 302001',
        materials: ['cucumber', 'lettuce', 'zucchini'],
        orders: [
            {
                id: '764860',
                raw_material_name: 'okra',
                order_date: new Date('2025-06-18').toISOString(),
                arrival_date: new Date('2025-06-20').toISOString(),
                est_arrival_date: new Date('2025-06-20').toISOString(),
                quantity: 1200,
                unit: 'kg',
                price: 150000,
                truck_detail: {
                    gross_weight: 25000,
                    tare_weight: 10500,
                    net_weight: 14500,
                },
            },
            {
                id: '764861',
                raw_material_name: 'radish',
                order_date: new Date('2025-06-15').toISOString(),
                arrival_date: new Date('2025-06-17').toISOString(),
                est_arrival_date: new Date('2025-06-17').toISOString(),
                quantity: 700,
                unit: 'kg',
                price: 110000,
                truck_detail: {
                    gross_weight: 20000,
                    tare_weight: 9500,
                    net_weight: 10500,
                },
            },
        ],
    },
];

const VendorSlice = createSlice({
    name: "vendors data",
    initialState: vendors,
    reducers: {
        selectUnie: (state, action) => {
            
        },
    },
});

export const { selectUnie } = VendorSlice.actions;
export default VendorSlice.reducer;
