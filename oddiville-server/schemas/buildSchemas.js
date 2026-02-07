const { isValid, format } = require("date-fns");
const { formatWeight, formatPrice } = require("../utils/bottomsheetUtils");
const { parseISO } = require("date-fns/parseISO");
const { formatAmount } = require("../utils/common");

const customTimeFormatter = (rawDate) => {
    if (!rawDate) return "N/A";
    const parsedDate =
        typeof rawDate === "string" ? parseISO(rawDate) : new Date(rawDate);
    return isValid(parsedDate) ? format(parsedDate, "hh:mmaaa") : "N/A";
};

const customDateFormatter = (rawDate) => {
    if (!rawDate) return "N/A";
    const parsedDate =
        typeof rawDate === "string" ? parseISO(rawDate) : new Date(rawDate);
    return isValid(parsedDate) ? format(parsedDate, "d MMM yyyy") : "N/A";
};

const normalizeUnit = (unit = "") => {
    const u = unit?.toLowerCase();
    if (u === "gm" || u === "g") return "gm";
    if (u === "qn" || u === "quintal") return "qn";
    return "kg";
};

function mapProduct(product, order, chambers) {
    const raw_weight = Array.isArray(product?.chambers)
        ? product.chambers.reduce(
            (sum, chamber) => sum + Number(chamber.quantity || 0),
            0
        )
        : 0;

    const product_weight = formatWeight(raw_weight, { unit: "kg" });
    const productName = product.product_name || product.name || "Unnamed product";

    return {
        title: productName,
        image: product.image,
        weight: product_weight,
        price: formatPrice(order.amount),
        description: `${product_weight} in ${product.chambers?.length ?? 0} ${product.chambers?.length === 1 ? "chamber" : "chambers"
            }`,
        chambers:
            product.chambers?.map((pc) => {
                const chamberMeta = chambers.find(
                    (c) => String(c.id) === String(pc.id)
                );

                return {
                    id: pc.id,
                    name: chamberMeta?.chamber_name ?? "Unknown Chamber", // ✅ REQUIRED
                    quantity: String(pc.quantity ?? 0),
                    unit: normalizeUnit(pc.unit),
                    rating: pc.rating,
                };
            }) || [],
    };
}

function getTotalQuantity(products = []) {
    return products.reduce((total, product) => {
        const chamberQty =
            product.chambers?.reduce(
                (sum, c) => sum + Number(c.quantity || 0),
                0
            ) || 0;
        return total + chamberQty;
    }, 0);
}

function getProductLabel(products = []) {
    const count = products.length;
    return `${count} ${count === 1 ? "product" : "products"}`;
}


function getProductDetailsSection(
    order,
    productDetails,
    totalQuantity,
    actor,
) {
    return [
        {
            row_1: [
                // { label: "Amount", value: formatPrice(order.amount) },
                { label: "Product", value: productDetails },
                { label: "Quantity", value: formatWeight(totalQuantity, { unit: "Kg" }) },
            ],
        },
        {
            row_2: [
                {
                    label: "Dis",
                    value:
                        order?.dispatch_date === null
                            ? "--"
                            : customDateFormatter(order?.dispatch_date),
                },
            ],
        },
        {
            row_3: [
                {
                    label: actor.key === "created" ? "Created By" : "Dispatched By",
                    value: actor.value,
                },
            ],
        }
    ];
}

function buildOrderSchemas({ order, chambers, currentUser }) {
    const totalQuantity = getTotalQuantity(order.products || []);
    const productDetails = getProductLabel(order.products || []);


    const base = {
        title: order?.customer_name,
        createdAt: order?.createdAt ?? "",
        description: order?.address,
        products: order?.products?.map(p =>
            mapProduct(p, order, chambers)
        ) || [],
    };

    return {
        "order-ready": {
            ...base,
            "Product Details": getProductDetailsSection(
                order,
                productDetails,
                totalQuantity,
                { key: "created", value: currentUser?.name ?? "N/A" }
            ),
        },

        "order-shipped": {
            ...base,
            "Product Details": getProductDetailsSection(
                order,
                productDetails,
                totalQuantity,
                { key: "shipped", value: currentUser?.name ?? "N/A" }
            ),
        },

        "order-reached": {
            ...base,
            "Product Details": getProductDetailsSection(
                order,
                productDetails,
                totalQuantity,
                { key: "reached", value: "" }
            ),
        },
    };
}

function buildRawMaterialSchemas({
    rmOrder,
    vendors,
    currentUser,
}) {
    if (!rmOrder || Object.keys(rmOrder).length === 0) {
        return {};
    }

    return {
        "raw-material-ordered": {
            title: rmOrder.raw_material_name,
            createdAt: rmOrder?.createdAt ?? "N/A",
            "Product Details": [
                {
                    label: "Order",
                    value: `${rmOrder.quantity_ordered} kg`,
                },
                {
                    label: "Amount",
                    value: formatAmount(rmOrder.price),
                },
                {
                    label: "Ordered By",
                    value: currentUser?.name ?? "N/A",
                },
            ],
            "Vendor detail": [
                { label: "Name", value: rmOrder.vendor },
                {
                    label: "Address",
                    value: vendors?.find(v => v.name === rmOrder.vendor)?.address,
                },
                {
                    label: "Est. Arrival date",
                    value: rmOrder.est_arrival_date
                        ? format(rmOrder.est_arrival_date, "d MMM yyyy")
                        : "--",
                },
            ],
        },

        "raw-material-reached": {
            title: rmOrder.raw_material_name,
            createdAt: rmOrder?.createdAt ?? "N/A",
            "Product Details": [
                {
                    label: "Order",
                    value: `${rmOrder.quantity_ordered} kg`,
                },
                {
                    label: "Recieved",
                    value: `${rmOrder.quantity_received} kg`,
                },
                {
                    label: "Amount",
                    value: formatAmount(rmOrder.price),
                },
                {
                    label: "Bags",
                    value: rmOrder.bags ? `${rmOrder.bags} Bags` : "No Bags",
                },
            ],
            "Vendor detail": [
                { label: "Name", value: rmOrder.vendor },
                {
                    label: "Address",
                    value: vendors?.find(v => v.name === rmOrder.vendor)?.address,
                },
                {
                    label: "Arrival date",
                    value: customDateFormatter(rmOrder.arrival_date),
                },
            ],
            "Truck detail": [
                {
                    label: "Truck number",
                    value: rmOrder?.truck_details?.truck_number,
                },
                {
                    label: "Driver name",
                    value: rmOrder?.truck_details?.driver_name,
                },
                {
                    label: "Truck Weight",
                    value: rmOrder?.truck_details?.truck_weight,
                },
            ],
            fileName:
                rmOrder?.truck_details?.challan?.url ||
                "https://oddiville-bucket.s3.us-west-2.amazonaws.com/raw-materials/08392beb-8040-4cc2-9bce-d87ace1011a6-5362bd4e-9bc4-4630-9ec7-5763753707cd.jpeg",
        },
    };
}

function buildProductionSchemas({
    production = {},
    lane = {},
    rmOrder = {},
}) {
    if (!lane || Object.keys(lane).length === 0) {
        return {
            "production-start": {},
            "production-completed": {},
            "lane-occupied": {}
        };
    }

    return {
        "production-start": {
            title: production?.product_name,
            createdAt: production?.createdAt ?? lane?.createdAt ?? "N/A",
            rating: Number(production?.rating),
            "image-full-width": rmOrder?.sample_image?.url || "N/A",
            "Product detail": [
                {
                    label: "Order",
                    value: `${Number(rmOrder?.quantity_ordered || 0) / 1000} Tons`,
                },
                {
                    label: "Recieved",
                    value: `${Number(rmOrder?.quantity_received || 0) / 1000} Tons`,
                },
            ],
            fileName:
                rmOrder?.truck_details?.challan?.url
                    ? [rmOrder.truck_details.challan.url]
                    : ["challan.png"],
        },

        "production-completed": {
            title: production?.product_name,
            createdAt: production?.createdAt ?? lane?.createdAt ?? "N/A",
            data: {
                "Production detail": [
                    {
                        row_1: [
                            {
                                label: "Supervisor",
                                value: production?.supervisor || "N/A",
                                icon: "user",
                            },
                            {
                                label: "Lane",
                                value: lane?.name,
                                icon: "lane",
                            },
                        ],
                    },
                    {
                        row_2: [
                            {
                                label: "Quantity",
                                value: String(production?.recovery),
                                icon: "database",
                            },
                            {
                                label: "Discard",
                                value: String(production?.wastage_quantity ?? "--"),
                                icon: "trash",
                            },
                        ],
                    },
                    {
                        row_3: [
                            {
                                label: "Recovery",
                                value: production?.quantity
                                    ? `${(
                                        (Number(production.recovery) / Number(production.quantity)) *
                                        100
                                    ).toFixed(2)}%`
                                    : "--",
                                icon: "lane",
                            },
                            {
                                label: production?.packaging?.type,
                                value: String(production?.packaging?.count || "no bags"),
                                icon: "box",
                            },
                        ],
                    },
                    {
                        row_4: [
                            {
                                label: "Completed",
                                value: customTimeFormatter(production?.end_time),
                                icon: "calendar-year",
                            },
                        ],
                    },
                ],
            },
            "image-gallery": production?.sample_images
                ?.map(img => img.url)
                ?.filter(Boolean),
        },

        "lane-occupied": {
            title: lane?.name,
            createdAt: lane?.createdAt ?? "N/A",
            data: {
                "Production detail": [
                    {
                        row_1: [
                            {
                                label: "Supervisor",
                                value: lane?.supervisor || "N/A",
                                icon: "user",
                            },
                            {
                                label: "Rating",
                                value: lane?.rating,
                                icon: "star",
                            },
                        ],
                    },
                    {
                        row_2: [
                            {
                                label: "Quantity",
                                value: String(lane?.quantity),
                                icon: "database",
                            },
                            {
                                label: "Sample",
                                value: `${rmOrder?.sample_quantity ?? 0} kg`,
                                icon: "color-swatch",
                            },
                        ],
                    },
                ],
            },
            "image-full-width":
                rmOrder?.sample_image?.url ||
                "https://oddiville-bucket.s3.us-west-2.amazonaws.com/raw-materials/08392beb-8040-4cc2-9bce-d87ace1011a6-5362bd4e-9bc4-4630-9ec7-5763753707cd.jpeg",
        },
    };
}

function buildWorkerSchemas({ contractors }) {
    if (!Array.isArray(contractors) || contractors.length === 0) {
        return {};
    }

    const totalWorkers = contractors.reduce(
        (acc, val) =>
            acc + (val.male_count || 0) + (val.female_count || 0),
        0
    );

    return {
        "worker-multiple": {
            title: `${totalWorkers} worker`,
            createdAt: contractors[0]?.createdAt ?? "",
            headerDetails: [
                {
                    label: "Male",
                    value: contractors.reduce(
                        (acc, val) => acc + (val.male_count || 0),
                        0
                    ),
                },
                {
                    label: "Female",
                    value: contractors.reduce(
                        (acc, val) => acc + (val.female_count || 0),
                        0
                    ),
                },
            ],
            table: contractors.map((contractor) => ({
                label: contractor?.name,
                tableHeader: [
                    { label: "Locations", key: "location", align: "left", width: 140 },
                    { label: "Male", key: "countMale", align: "right", width: 60 },
                    { label: "Female", key: "countFemale", align: "right", width: 60 },
                ],
                tableBody:
                    contractor?.work_location
                        ?.filter((loc) => !loc.notNeeded)
                        ?.map((loc) => ({
                            location: loc?.name,
                            countMale: loc?.countMale,
                            countFemale: loc?.countFemale,
                        })) || [],
            })),
        },

        "worker-single": {
            title: `${totalWorkers} worker`,
            createdAt: contractors[0]?.createdAt ?? "",
            "Vendor detail": [
                {
                    row_1: [
                        {
                            label: "Contractor",
                            value: contractors[0]?.name ?? "N/A",
                        },
                    ],
                },
                {
                    row_2: [
                        {
                            label: "Male",
                            value: contractors[0]?.male_count ?? 0,
                        },
                        {
                            label: "Female",
                            value: contractors[0]?.female_count ?? 0,
                        },
                    ],
                },
            ],
            table: {
                tableHeader: [
                    { label: "Locations", key: "location" },
                    { label: "Count", key: "count" },
                ],
                tableBody:
                    contractors[0]?.work_location?.map((loc) => ({
                        location: loc?.name,
                        count:
                            (loc?.countMale || 0) + (loc?.countFemale || 0),
                    })) || [],
            },
        },
    };
}

function buildVendorSchemas({ vendors }) {
    if (!Array.isArray(vendors)) return {};

    return {
        "add-vendor": {
            title: "Add vendor",
            vendorCard: vendors.map((vendor) => ({
                name: vendor.name,
                address: vendor.address,
                isChecked: false,
                materials: vendor.materials,
            })),
        },
    };
}

function buildGeographySchemas({ countries, states, cities }) {
    const listSections = ["Recent", "Countries"];

    return {
        country: {
            title: "Country",
            "icon-title-with-heading": listSections.map((title) =>
                title === "Recent"
                    ? { title, iconTitle: [] }
                    : {
                        title,
                        iconTitle: (countries || []).map((country) => ({
                            label: country.name,
                            icon: "https://placehold.co/600x400/000000/FFFFFF/png",
                            isoCode: country.isoCode,
                        })),
                    }
            ),
        },

        state: {
            title: "State",
            optionList: states,
        },

        city: {
            title: "City",
            optionList: cities,
        },
    };
}

function buildCalendarSchemas({ calendarEvent }) {
    if (!calendarEvent || Object.keys(calendarEvent).length === 0) {
        return {};
    }

    const title = format(
        new Date(calendarEvent.scheduled_date),
        "MMM d, yyyy"
    );

    const base = {
        title,
        createdAt: calendarEvent.createdAt ?? "N/A",
    };

    return {
        "calendar-event-scheduled": {
            ...base,
            "Event Details": [
                {
                    label: "Title",
                    value: calendarEvent.product_name,
                },
                {
                    label: "Description",
                    value: calendarEvent.work_area,
                },
            ],
        },

        "scheduled-date-event": {
            ...base,
            "Event Details": [
                {
                    label: "Product",
                    value: calendarEvent.product_name,
                },
                {
                    label: "Area",
                    value: calendarEvent.work_area,
                },
            ],
            "Time Details": [
                {
                    label: "Start Time",
                    value: calendarEvent.start_time,
                },
                {
                    label: "End Time",
                    value: calendarEvent.end_time,
                },
            ],
        },
    };
}

function buildPackingSummarySchema({ packingSummary }) {
    if (!packingSummary || Object.keys(packingSummary).length === 0) {
        return {};
    }

    return {
        "packing-summary": {
            product: packingSummary.product ?? "",
            sku: packingSummary.sku ?? "",
            summary: packingSummary.summary ?? {
                totalBags: 0,
                totalPackets: 0,
                eventsCount: 0,
                lastEventAt: null,
            },
            skuSummary: packingSummary.skuSummary ?? [],
            chambers: packingSummary.chambers ?? [],
            rawMaterials: packingSummary.rawMaterials ?? [],
        },
    };
}

function buildUISchemas({
    rawMaterials,
    productNames,
    chambers,
    packingEvents = [],
    chamberStocks = [],
}) {
    const safeRawMaterials = Array.isArray(rawMaterials) ? rawMaterials : [];

    return {
        "package-comes-to-end": {
            title: "250gm package",
            description: "India | 200 left",
        },

        "add-raw-material": {
            title: "Add raw materials",
            productCard: safeRawMaterials.map((rawMaterial) => ({
                name: rawMaterial?.name || "Unnamed",
                image:
                    typeof rawMaterial?.sample_image === "string"
                        ? rawMaterial.sample_image
                        : rawMaterial?.sample_image?.url ?? "/images/fallback.png",
                description: rawMaterial?.description || "No description available",
            })),
        },

        "add-product": {
            title: "Add products",
            optionList: productNames,
        },
        "multiple-product-card": {
            title: "Choose products",

            packingEvents,
            chamberStocks,
        },

        "choose-product": {
            title: "Select products",
            productCard: safeRawMaterials.map((rawMaterial) => ({
                name: rawMaterial.name ?? "Unnamed",
                description: "22 Kg",
            })),
        },

        "chamber-list": {
            optionList: chambers
                .slice()
                .sort((a, b) => a.chamber_name.localeCompare(b.chamber_name))
                .filter((ch) => ch.tag === "frozen")
                .map((ch) => ch.chamber_name)
                .filter(Boolean),
        },

        "multiple-chamber-list": {
            title: "Select chambers",
            productCard: chambers
                .slice()
                .sort((a, b) => a.chamber_name.localeCompare(b.chamber_name))
                .filter((ch) => ch.tag === "frozen")
                .map((chamber) => ({
                    name: chamber.chamber_name ?? "Unnamed",
                    image: "",
                })),
        },
    };
}

module.exports = {
    buildOrderSchemas,
    buildRawMaterialSchemas,
    buildProductionSchemas,
    buildWorkerSchemas,
    buildVendorSchemas,
    buildGeographySchemas,
    buildCalendarSchemas,
    buildPackingSummarySchema,
    buildUISchemas,
};