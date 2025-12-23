const { isValid } = require("date-fns");
const { formatWeight, formatPrice } = require("../utils/bottomsheetUtils");
const { format } = require("date-fns/format");
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

// function formatPackagesSentence(packages = []) {
//   if (!packages.length) return "";

//   const totalPackagesQuantity = packages.reduce(
//     (sum, pkg) => sum + Number(pkg.quantity || 0),
//     0
//   );

//   const packagesSize = packages
//     .map((pkg) => `${pkg.size}${pkg.unit}`)
//     .filter(Boolean);

//   if (packagesSize.length === 1)
//     return `${totalPackagesQuantity} packages of ${packagesSize[0]}`;
//   if (packagesSize.length === 2)
//     return `${totalPackagesQuantity} packages of ${packagesSize.join(" & ")}`;
//   if (packagesSize.length > 2) {
//     const last = packagesSize.pop();
//     return `${totalPackagesQuantity} packages of ${packagesSize.join(
//       ", "
//     )} & ${last}`;
//   }

//   return "";
// }

function mapProduct(product, DispatchOrder) {
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
    price: formatPrice(DispatchOrder.amount),
    description: `${product_weight} in ${product.chambers?.length ?? 0} ${
      product.chambers?.length === 1 ? "chamber" : "chambers"
    }`,
    chambers:
      product.chambers?.map((pc) => ({
        ...pc,
        unit: normalizeUnit(pc.unit),
        quantity: String(pc.quantity ?? 0),
      })) || [],
  };
}

// packages:
//   DispatchOrder.packages?.map((val) => ({
//     size: val.size,
//     unit: val.unit || "kg",
//     quantity: String(val.quantity),
//   })) || [],
// packagesSentence,

// function mapProduct(product, DispatchOrder) {
//   const raw_weight =
//     product?.chambers?.reduce(
//       (sum, chamber) => sum + Number(chamber.quantity),
//       0
//     ) || 0;
//   const product_weight = formatWeight(raw_weight, { unit: "Kg" });
//   const packagesSentence = formatPackagesSentence(DispatchOrder.packages || []);

//   product?.chambers?.forEach((c) => {
//     c.unit = "kg";
//   });

//   return {
//     title: DispatchOrder.product_name,
//     image: product.image,
//     weight: product_weight,
//     price: formatPrice(DispatchOrder.amount),
//     description: `${product_weight} in ${product.chambers?.length ?? 0} ${
//       product.chambers?.length === 1 ? "chamber" : "chambers"
//     }`,
//     chambers: product.chambers.map(pc => ({
//       ...pc,
//       quantity: String(pc.quantity),
//     })),
//     packages:
//       DispatchOrder.packages?.map((val) => ({
//         size: val.size,
//         unit: val.unit || "kg",
//         quantity: String(val.quantity),
//       })) || [],
//     packagesSentence,
//   };
// }


function getProductDetailsSection(
  DispatchOrder,
  product_details,
  totalQuantity,
  order,
) {
  return [
    {
      row_1: [
        // { label: "Amount", value: formatPrice(DispatchOrder.amount) },
        { label: "Product", value: product_details },
        { label: "Quantity", value: formatWeight(totalQuantity, { unit: "Kg" }) },
      ],
    },
    {
      row_2: [
        {
          label: "Dis",
          value:
            DispatchOrder?.dispatch_date === null
              ? "--"
              : customDateFormatter(DispatchOrder?.dispatch_date),
        },
      ],
    },
    {
     row_3: [
      { label: order.key === "created" ? "Created By" : "Dispatched By", value: order.value },
     ]
    }
  ];
}

const getFillerSchema = ({
  RawMaterials = [],
  Vendors = [],
  Chambers = [],
  RawMaterialOrderById = {},
  countries = [],
  states = [],
  cities = [],
  DispatchOrder = {},
  Products = [],
  LaneById = {},
  ProductionById = {},
  Contractors = [],
  VendorById = {},
  CalendarEvent = {},
  authenticatedUser = {},
}) => {
  
  const listSections = ["Recent", "Countries"];

  const totalQuantity = DispatchOrder?.products?.reduce(
    (productTotal, product) => {
      const chamberTotal = product.chambers?.reduce(
        (sum, chamber) => sum + Number(chamber.quantity),
        0
      );
      return productTotal + chamberTotal;
    },
    0
  );

  const product_details = `${DispatchOrder?.products?.length} ${
    DispatchOrder?.products?.length === 1 ? "product" : "products"
  }`;

  const urlValue = RawMaterialOrderById?.truck_details?.challan?.url;
  const fileName = Array.isArray(urlValue)
    ? urlValue
    : urlValue
    ? [urlValue]
    : ["challan.png"];
const safeRawMaterials = Array.isArray(RawMaterials) ? RawMaterials : [];

  return {
    "order-ready": {
      title: DispatchOrder?.customer_name,
      createdAt: DispatchOrder?.createdAt ?? "",
      description: DispatchOrder?.address,
      "Product Details": getProductDetailsSection(
        DispatchOrder,
        product_details,
        totalQuantity,
        {key: "created", value: authenticatedUser && authenticatedUser.name ? authenticatedUser.name : "N/A"},
      ),
      Products:
        DispatchOrder?.products?.map((product) =>
          mapProduct(product, DispatchOrder)
        ) || [],

      buttons: [
        {
          text: "Shipped order",
          variant: "outline",
          color: "green",
          alignment: "full",
          disabled: DispatchOrder?.status !== "pending",
          actionKey: "ship-order",
        },
      ],
    },
    "order-shipped": {
      title: DispatchOrder?.customer_name,
      createdAt: DispatchOrder?.createdAt ?? "",
      description: DispatchOrder?.address,
      "Product Details": getProductDetailsSection(
        DispatchOrder,
        product_details,
        totalQuantity,
        {key: "shipped", value: authenticatedUser && authenticatedUser.name ? authenticatedUser.name : "N/A"},
      ),

      fileName: DispatchOrder?.sample_images?.[0] || "no-challan.pdf",

      "Truck Detail": {
        driverName: DispatchOrder?.truck_details?.driver_name,
        driverImage:
          "https://live-typing-test-bucket.s3.us-east-1.amazonaws.com/dispatchOrder/challan/897d0758-7a7a-407d-9605-c5a0ebe697e6-a5e24245-051b-4c0c-ba04-c18698efe122.png",
        number: DispatchOrder?.truck_details?.number,
        type: DispatchOrder?.truck_details?.type,
        arrival_date: customDateFormatter(DispatchOrder?.est_delivered_date),
        agency: DispatchOrder?.truck_details?.agency_name,
      },

      Products:
        DispatchOrder?.products?.map((product) =>
          mapProduct(product, DispatchOrder)
        ) || [],

      buttons: [
        {
          text: "Order reached",
          variant: "fill",
          color: "green",
          alignment: "full",
          disabled: DispatchOrder?.status === "completed",
          actionKey: "order-reached",
        },
        {
          text: "Cancel order",
          variant: "ghost",
          color: "green",
          alignment: "half",
          disabled: true,
          actionKey: "cancel-order",
        },
        {
          text: "Change truck",
          variant: "ghost",
          color: "green",
          alignment: "half",
          disabled: true,
        },
      ],
    },
    "order-reached": {
      title: DispatchOrder?.customer_name,
      createdAt: DispatchOrder?.createdAt ?? "",
      description: DispatchOrder?.address,
      "Product Details": getProductDetailsSection(
        DispatchOrder,
        product_details,
        totalQuantity,
        {key: "reached", value: ""},
      ),

      fileName: DispatchOrder?.sample_images?.[0] || "no-challan.pdf",

      "Truck Detail": {
        driverName: DispatchOrder?.truck_details?.driver_name,
        driverImage:
        "https://live-typing-test-bucket.s3.us-east-1.amazonaws.com/dispatchOrder/challan/897d0758-7a7a-407d-9605-c5a0ebe697e6-a5e24245-051b-4c0c-ba04-c18698efe122.png",
        number: DispatchOrder?.truck_details?.number,
        type: DispatchOrder?.truck_details?.type,
        arrival_date: customDateFormatter(DispatchOrder?.est_delivered_date),
        agency: DispatchOrder?.truck_details?.agency_name,
      },

      Products:
        DispatchOrder?.products?.map((product) =>
          mapProduct(product, DispatchOrder)
        ) || [],
    },
    "package-comes-to-end": {
      title: "250gm package",
      description: "India | 200 left",
    },
    "production-start": {
      title: ProductionById?.product_name,
      createdAt: ProductionById?.createdAt ?? "N/A",
      rating: Number(ProductionById?.rating),
      "image-full-width": RawMaterialOrderById?.sample_image?.url || "N/A",
      "Product detail": [
        {
          label: "Order",
          value: `${
            Number(RawMaterialOrderById?.quantity_ordered) / 1000
          } Tons`,
        },
        {
          label: "Recieved",
          value: `${
            Number(RawMaterialOrderById?.quantity_received) / 1000
          } Tons`,
        },
      ],
      fileName,
      // "Vendor detail": [
      //     { label: "Name", value: VendorById?.name },
      //     { label: "Address", value: VendorById?.address },
      //     { label: "Arrival date", value: customDateFormatter(RawMaterialOrderById?.arrival_date) }
      // ],
      // "Truck detail": {
      //     detailsA: [
      //         { label: "Truck Weight", value: RawMaterialOrderById?.truck_details?.truck_weight },
      //         { label: "Tare Weight", value: RawMaterialOrderById?.truck_details?.tare_weight }
      //     ],
      //     detailsB: [
      //         { label: "Product Weight", value: (Number(RawMaterialOrderById?.truck_details?.truck_weight) - Number(RawMaterialOrderById?.truck_details?.tare_weight)).toFixed(2) }
      //     ]
      // },
    },
    "production-completed": {
      title: ProductionById?.product_name,
      createdAt: ProductionById?.createdAt ?? "N/A",
      data: {
        "Production detail": [
          {
            row_1: [
              {
                label: "Supervisor",
                value: ProductionById?.supervisor || "N/A",
                icon: "user",
              },
              {
                label: "Lane",
                value: LaneById?.name,
                icon: "lane",
              },
            ],
          },
          {
            row_2: [
              {
                label: "Quantity",
                value: String(ProductionById?.recovery),
                icon: "database",
              },
              {
                label: "Discard",
                value: String(ProductionById?.wastage_quantity) ?? "--",
                icon: "trash",
              },
            ],
          },
          {
            row_3: [
              {
                label: "Recovery",
              value:
                ProductionById?.quantity
                  ? `${(
                      (Number(ProductionById.recovery) /
                        Number(ProductionById.quantity)) *
                      100
                    ).toFixed(2)}%`
                  : "--",
                icon: "lane",
              },
              {
                label: ProductionById?.packaging?.type,
                value: String(ProductionById?.packaging?.count || "no bags") ?? "--",
                icon: "box",
              },
            ],
          },
          {
            row_4: [
              {
                label: "Completed",
                value:
                  Object.keys(ProductionById).length !== 0 &&
                  customTimeFormatter(ProductionById?.end_time),
                icon: "calendar-year",
              },
            ],
          },
        ],
      },
      "image-gallery": ProductionById?.sample_images
        ?.map((img) => img.url)
        ?.filter(Boolean),
    },
    "raw-material-ordered": {
      title: RawMaterialOrderById.raw_material_name,
      createdAt: RawMaterialOrderById?.createdAt ?? "N/A",
      "Product Details": [
        {
          label: "Order",
          value: `${RawMaterialOrderById.quantity_ordered} kg`,
        },
        {
          label: "Amount",
          value: `${formatAmount(RawMaterialOrderById.price)} `,
        },
        {
          label: "Ordered By",
          value: `${authenticatedUser && authenticatedUser.name ? authenticatedUser.name : "N/A"} `,
        },
      ],
      "Vendor detail": [
        { label: "Name", value: RawMaterialOrderById.vendor },
        {
          label: "Address",
          value: Vendors?.find(
            (val) => val.name === RawMaterialOrderById.vendor
          )?.address,
        },
        {
          label: "Est. Arrival date",
          value: RawMaterialOrderById.est_arrival_date
            ? format(RawMaterialOrderById.est_arrival_date, "d MMM yyyy")
            : "--",
        },
      ],
    },
    "raw-material-reached": {
      title: RawMaterialOrderById.raw_material_name,
      createdAt: RawMaterialOrderById?.createdAt ?? "N/A",
      "Product Details": [
        {
          label: "Order",
          value: `${RawMaterialOrderById.quantity_ordered} kg`,
        },
        {
          label: "Recieved",
          value: `${RawMaterialOrderById.quantity_received} kg`,
        },
        {
          label: "Amount",
          value: `${formatAmount(RawMaterialOrderById.price)}`,
        },
        {
          label: "Bags",
          value: RawMaterialOrderById.bags ? `${RawMaterialOrderById.bags} Bags` : "No Bags",
        },
      ],
      "Vendor detail": [
        { label: "Name", value: RawMaterialOrderById.vendor },
        {
          label: "Address",
          value: Vendors?.find(
            (val) => val.name === RawMaterialOrderById.vendor
          )?.address,
        },
        {
          label: "Arrival date",
          value: customDateFormatter(RawMaterialOrderById.arrival_date),
        },
      ],
      "Truck detail": [
        {
          label: "Truck number",
          value: RawMaterialOrderById?.truck_details?.truck_number,
        },
        {
          label: "Driver name",
          value: RawMaterialOrderById?.truck_details?.driver_name,
        },
        {
          label: "Truck Weight",
          value: RawMaterialOrderById?.truck_details?.truck_weight,
        },
      ],
      fileName:
        RawMaterialOrderById?.truck_details?.challan?.url ||
        "https://oddiville-bucket.s3.us-west-2.amazonaws.com/raw-materials/08392beb-8040-4cc2-9bce-d87ace1011a6-5362bd4e-9bc4-4630-9ec7-5763753707cd.jpeg",
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
      title: "Add Products",
      optionList: Products,
    },
    "choose-product": {
      title: "Select products",
      productCard: (Array.isArray(RawMaterials) ? RawMaterials : []).map((rawMaterial) => ({
        name: rawMaterial.name ?? "Unnamed",
        description: "22 Kg",
      })),
    },
    "worker-multiple": {
      title: `${Contractors?.reduce(
        (acc, val) => acc + (val.male_count || 0) + (val.female_count || 0),
        0
      )} worker`,
      createdAt: Contractors[0]?.createdAt ?? "",
      headerDetails: [
        {
          label: "Male",
          value: Contractors?.reduce((acc, val) => acc + val.male_count, 0),
        },
        {
          label: "Female",
          value: Contractors?.reduce((acc, val) => acc + val.female_count, 0),
        },
      ],
      table: Contractors?.map((contractor) => {
        return {
          label: contractor?.name,
          tableHeader: [
            { label: "Locations", key: "location", align: "left", width: 140 },
            { label: "Male", key: "countMale", align: "right", width: 60 },
            { label: "Female", key: "countFemale", align: "right", width: 60 },
          ],

          tableBody: contractor?.work_location
            ?.map((location) => {
              if (!location.notNeeded) {
                return {
                  location: location?.name,
                  countMale: location.countMale,
                  countFemale: location.countFemale,
                  // count: location.count
                };
              }
            })
            ?.filter(Boolean),
        };
      }),
    },
    "worker-single": {
      title: "32 worker",
      createdAt: Contractors[0]?.createdAt ?? "",
      "Vendor detail": [
        {
          row_1: [
            {
              label: "Contractor",
              value: "Vikram Patel",
            },
          ],
        },
        {
          row_2: [
            {
              label: "Male",
              value: "20",
            },
            {
              label: "Female",
              value: "10",
            },
          ],
        },
      ],
      table: {
        tableHeader: [
          { label: "Locations", key: "location" },
          { label: "Count", key: "count" },
        ],

        tableBody: [
          { location: "Location 1", count: "2" },
          { location: "Location 2", count: "5" },
          { location: "Location 3", count: "5" },
          { location: "Location 4", count: "5" },
        ],
      },
    },
    "add-vendor": {
      title: "Add vendor",
      vendorCard: Vendors.map((vendor) => ({
        name: vendor.name,
        address: vendor.address,
        isChecked: false,
        materials: vendor.materials,
      })),
    },
    "chamber-list": {
      optionList: Chambers.slice()
        .sort((a, b) => a.chamber_name.localeCompare(b.chamber_name))
        .filter((ch) => ch.tag === "frozen")
        .map((ch) => ch.chamber_name)
        .filter(Boolean),
    },
    "multiple-chamber-list": {
      title: "Select Chambers",
      productCard: Chambers.slice()
        .sort((a, b) => a.chamber_name.localeCompare(b.chamber_name))
        .filter((ch) => ch.tag === "frozen")
        .map((chamber) => ({
          name: chamber.chamber_name ?? "Unnamed",
          image: "",
        })),
    },
    country: {
      title: "Country",
      "icon-title-with-heading": listSections?.map((title) =>
        title === "Recent"
          ? { title: title, iconTitle: [] }
          : {
              title: title,
              iconTitle: countries?.map((country) => ({
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
    "lane-occupied": {
      title: LaneById?.name,
      createdAt: LaneById?.createdAt ?? "N/A",
      data: {
        "Production detail": [
          {
            row_1: [
              {
                label: "Supervisor",
                value: ProductionById?.supervisor || "N/A",
                icon: "user",
              },
              {
                label: "Rating",
                value: ProductionById?.rating,
                icon: "star",
              },
            ],
          },
          {
            row_2: [
              {
                label: "Quantity",
                value: String(ProductionById?.quantity),
                icon: "database",
              },
              {
                label: "Sample",
                value: `${String(RawMaterialOrderById?.sample_quantity)} kg` ?? "--",
                icon: "color-swatch",
              },
            ],
          },
        ],
      },
      "image-full-width":
        RawMaterialOrderById?.sample_image?.url ||
        "https://oddiville-bucket.s3.us-west-2.amazonaws.com/raw-materials/08392beb-8040-4cc2-9bce-d87ace1011a6-5362bd4e-9bc4-4630-9ec7-5763753707cd.jpeg",
    },
    "calendar-event-scheduled": {
      title:
        Object.keys(CalendarEvent).length !== 0 &&
        format(new Date(CalendarEvent.scheduled_date), "MMM d, yyyy"),
      createdAt: CalendarEvent?.createdAt ?? "N/A",
      "Event Details": [
        {
          label: "Title",
          value: CalendarEvent.product_name,
        },
        {
          label: "Description",
          value: CalendarEvent.work_area,
        },
      ],
    },
    "scheduled-date-event": {
      title:
        Object.keys(CalendarEvent).length !== 0 &&
        format(new Date(CalendarEvent.scheduled_date), "MMM d, yyyy"),
      createdAt: CalendarEvent?.createdAt ?? "N/A",
      "Event Details": [
        {
          label: "Product",
          value: CalendarEvent.product_name,
        },
        {
          label: "Area",
          value: CalendarEvent.work_area,
        },
      ],
      "Time Details": [
        {
          label: "Start Time",
          value: CalendarEvent.start_time,
        },
        {
          label: "StaEndrt Time",
          value: CalendarEvent.end_time,
        },
      ],
    },
  };
};

module.exports = { getFillerSchema };
