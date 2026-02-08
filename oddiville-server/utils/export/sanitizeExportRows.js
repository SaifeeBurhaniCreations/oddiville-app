const SYSTEM_FIELDS = new Set([
    "id",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "raw_material_order_id",
    "production_id",
]);

const COLUMN_ORDER = {
    Production: [
        "product_name",
        "quantity",
        "unit",
        "status",
        "start_time",
        "end_time",
    ],

    Dispatch: [
        "customer_name",
        "city",
        "state",
        "status",
        "dispatch_date",
        "delivered_date",
        "amount",
    ],

    "Raw Materials": [
        "raw_material_name",
        "vendor",
        "quantity_ordered",
        "quantity_received",
        "unit",
        "status",
    ],
};

const sanitizeRow = (row, extraRemove = []) => {
    const json = row.toJSON();
    const remove = new Set([...SYSTEM_FIELDS, ...extraRemove]);

    return Object.fromEntries(
        Object.entries(json)
            .filter(([key]) => !remove.has(key))
            .map(([key, value]) => [
                key,
                typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : value,
            ])
    );
};

const applyColumnOrder = (rows, sheetName) => {
    if (!rows.length) return rows;

    const preferredOrder = COLUMN_ORDER[sheetName];
    if (!preferredOrder) return rows; // no custom order → default

    const existingKeys = Object.keys(rows[0]);

    const orderedKeys = [
        ...preferredOrder.filter((k) => existingKeys.includes(k)),
        ...existingKeys.filter((k) => !preferredOrder.includes(k)),
    ];

    return rows.map((row) =>
        Object.fromEntries(orderedKeys.map((k) => [k, row[k]]))
    );
};

module.exports = {
    sanitizeRow,
    applyColumnOrder,
};