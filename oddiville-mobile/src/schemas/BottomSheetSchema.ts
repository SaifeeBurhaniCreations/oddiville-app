import { z } from "zod";

// ------------------- Section Variants ------------------- //

export const filterEnum = z.enum([
  "chamber:detailed",
  "home:activities",
  "packing:summary",
  "order:upcoming",
  "order:inprogress",
  "order:completed",
  "raw-material:overview",
  "raw-material:detailed",
  "vendor:order",
  "vendor:overview",
  "user:overview",
]);

export type FilterEnum = z.infer<typeof filterEnum>;

const detailItem = z.object({
  label: z.string(),
  value: z.string(),
  icon: z.enum([
    "database",
    "user",
    "location",
    "calendar-check",
    "user-square",
    "truck",
    "truck-num",
    "clock",
    "package",
    "chamber",
    "male",
    "female",
    "money",
    "box",
    "lane",
    "color-swatch",
    "trash",
    "star",
    "calendar-year",
    "file",
  ]),
});

// Section: Header
const HeaderSection = z.object({
  type: z.literal("header"),
  data: z.object({
    label: z.string(),
    value: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    headerdetails: z.array(detailItem).default([]),
    color: z.enum(["green", "red", "blue", "yellow"]),
    icon: z.enum([
      "calendar",
      "calendarCheck",
      "database",
      "parcel",
      "user",
      "location",
      "truck",
      "user-square",
      "truck-num",
      "clock",
    ]),
  }),
});

const FullWidthImageSection = z.object({
  type: z.literal("image-full-width"),
  data: z.object({
    imageUrl: z.string(),
  }),
});

const RatingSection = z.object({
  type: z.literal("rating"),
  data: z.object({
    label: z.string(),
    selected: z.number().int().min(0).max(5),
  }),
});

const DataAccordianSection = z.object({
  type: z.literal("data-accordian"),
  data: z.array(
    z.object({
      title: z.string(),
      details: z.array(detailItem),
      detailsA: z.array(detailItem).optional(),
      detailsB: z.array(detailItem).optional(),
      fileName: z.array(z.string()).optional(),
    })
  ),
});

const ImageGallerySection = z.object({
  type: z.literal("image-gallery"),
  data: z.array(z.string()),
});

const detailRows = z.record(z.array(detailItem));

const DataSection = z.object({
  type: z.literal("data"),
  data: z.array(
    z.object({
      title: z.string(),
      details: z.array(detailRows),
      fileName: z.string().optional(),
    })
  ),
});

const DescriptionSection = z.object({
  type: z.literal("description"),
  data: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const DataGroupSection = z.object({
  type: z.literal("data-group"),
  data: z.array(
    z.object({
      title: z.string(),
      details: z.array(detailItem),
      detailsA: z.array(detailItem).optional(),
      detailsB: z.array(detailItem).optional(),
      fileName: z.string().optional(),
    })
  ),
});

const TableSection = z.object({
  type: z.literal("table"),
  data: z.array(
    z.object({
      label: z.string().optional(),
      count: z.number().optional(),
      tableHeader: z.array(
        z.object({
          label: z.string(),
          key: z.string(),
        })
      ),
      tableBody: z.array(
        z.record(z.string(), z.union([z.string(), z.number()]))
      ),
    })
  ),
});

const ProductListSection = z.object({
  type: z.literal("product-list"),
  data: z.object({
    label: z.string().optional(),
    detailView: z.object({
      text: z.string(),
      isDetailView: z.boolean(),
    }),
    products: z.array(
      z.object({
        title: z.string(),
        image: z.string(),
        description: z.string(),
        packagesSentence: z.string(),
        weight: z.string(),
        price: z.string(),
        packages: z.array(
          z.object({
            size: z.union([z.string(), z.number()]),
            unit: z.enum(["kg", "gm"]),
            quantity: z.string(),
          })
        ),
        chambers: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            quantity: z.string(),
            unit: z.enum(["kg", "gm", "qn"]),
          })
        ),
      })
    ),
  }),
});

const ProductDtailsSection = z.object({
  type: z.literal("product-details"),
  data: z.array(
    z.object({
      title: z.string(),
      details: z.array(detailRows).optional(),
      fileName: z.string(),
    })
  ),
});
const TruckFullDetailsSection = z.object({
  type: z.literal("truck-full-details"),
  data: z.object({
    title: z.string(),
    date_title: z.string(),
    driverName: z.string(),
    number: z.string(),
    type: z.string(),
    agency: z.string(),
    arrival_date: z.string(),
    driverImage: z.string(),
  }),
});

const ProductListAccoridanSection = z.object({
  type: z.literal("product-list-accordian"),
  data: z.object({
    label: z.string().optional(),
    detailView: z
      .object({
        text: z.string(),
        isDetailView: z.boolean(),
      })
      .optional(),
    products: z.array(
      z.object({
        title: z.string(),
        image: z.string(),
        description: z.string(),
        packagesSentence: z.string(),
        weight: z.string(),
        price: z.string(),
        chambers: z.array(
          z.object({
            name: z.string(),
            quantity: z.string(),
            id: z.string(),
          })
        ),
        packages: z.array(
          z.object({
            size: z.union([z.number(), z.string()]),
            quantity: z.union([z.string(), z.number()]),
            unit: z.string(),
          })
        ),
      })
    ),
  }),
});

const FullWidthSliderSection = z.object({
  type: z.literal("full-width-slider"),
  data: z.array(z.string()),
});

// Section: Title with Tag
const TitleWithTagSection = z.object({
  type: z.literal("titleWithTag"),
  data: z.object({
    label: z.string(),
    tag: z.object({
      text: z.string(),
      color: z.enum(["red", "green", "blue", "yellow"]),
      size: z.enum(["sm", "md", "lg"]).optional(),
    }),
    rating: z.number().optional(),
  }),
});

// Section: Search
const SearchSection = z.object({
  type: z.literal("search"),
  data: z.object({
    searchTerm: z.string(),
    placeholder: z.string(),
    searchType: z
      .enum([
        "city",
        "state",
        "country",
        "add-raw-material",
        "add-product",
        "add-package",
      ])
      .optional(),
  }),
});

// Section: Input
const InputSection = z.object({
  type: z.literal("input"),
  data: z.object({
    label: z.string().optional(),
    placeholder: z.string().optional(),
    value: z.string().optional(),
    addon: z.string().optional(),
    keyboardType: z
      .enum([
        "default",
        "numeric",
        "email-address",
        "number-pad",
        "decimal-pad",
        "phone-pad",
      ])
      .optional(),
    formField: z.string().optional(),
  }),
});

// Section: Title With Checkbox
const TitleWithCheckboxSection = z.object({
  type: z.literal("title-with-checkbox"),
  data: z.object({
    key: filterEnum,
    options: z
      .array(
        z.object({
          text: z.string(),
          isChecked: z.boolean(),
        })
      )
      .optional(),
  }),
});

// Section: Address
const AddressSection = z.object({
  type: z.literal("address"),
  data: z.object({
    label: z.string(),
    value: z.string(),
    icon: z
      .enum(["calendar", "calendarCheck", "database", "parcel", "location"])
      .optional(),
  }),
});

// Section: input with select
const InputWithSelectSection = z.object({
  type: z.literal("input-with-select"),
  data: z.object({
    placeholder: z.string(),
    placeholder_second: z.string().optional(),
    label: z.string(),
    label_second: z.string().optional(),
    value: z.string().optional(),
    value_second: z.string().optional(),
    conditionKey: z.enum(["hideUntilChamberSelected"]).optional(),
    hasUniqueProp: z
      .object({ key: z.string(), identifier: z.string() })
      .optional(),
    alignment: z.enum(["full", "half"]).default("full").optional(),
    key: z.enum([
      "add-raw-material",
      "package-weight",
      "supervisor-production",
      "select-package-type",
    ]),
    formField_1: z.string().optional(),
    formField_2: z.string().optional(),
    source: z
      .enum(["add-product-package", "add-package", "supervisor-production"])
      .optional(),
  }),
});

// Section: select group
const SelectGroupSection = z.object({
  type: z.literal("select-group"),
  data: z.object({
    labels: z.array(z.string()),
    values: z.array(z.string()),
  }),
});

// Section: Manage Action
const manageActionSection = z.object({
  type: z.literal("manageAction"),
  data: z.array(
    z.object({
      title: z.string(),
      actionKey: z.string(),
    })
  ),
});
const PackagingSizeSection = z.object({
  type: z.literal("package-size-choose-list"),
  data: z.object({
    list: z.array(
      z.object({
        name: z.string(),
        size: z.number(),
        unit: z.enum(["gm", "kg"]),
        count: z.number(),
        icon: z.enum(["paper-roll", "bag", "big-bag"]),
        isChecked: z.boolean(),
      })
    ),
    source: z.enum(["package", "dispatch"]),
    productId: z.string().optional(),
  }),
});

export const ChamberSchema = z.object({
  id: z.string(),
  quantity: z.string(),
  rating: z.string(),
});
export const PackageItemSchema = z.object({
  rawSize: z.string(),
  size: z.number(),
  unit: z.enum(["kg", "gm", "qn"]).nullable(),
  quantity: z.string(),
  icon: z.string().optional(),
});

const MultipleProductSection = z.object({
  type: z.literal("multiple-product-card"),
  data: z.array(
    z.object({
      id: z.string(),
      product_name: z.string(),
      rating: z.number(),
      description: z.string().optional(),
      image: z.string().nullish().optional(),
      isChecked: z.boolean(),
      packages: z.array(PackageItemSchema),
      chambers: z.array(ChamberSchema),
    })
  ),
});

// Section: image preview
const ImagePreviewSection = z.object({
  type: z.literal("image-preview"),
  data: z.object({
    imageUri: z.string(),
  }),
});

// Section: ICon title Heading
const IconTitleWithHeadingSection = z.object({
  type: z.literal("icon-title-with-heading"),
  data: z.array(
    z.object({
      title: z.string(),
      iconTitle: z.array(
        z.object({
          label: z.string(),
          icon: z.string(),
          isoCode: z.string(),
        })
      ),
    })
  ),
});

const TitleCheckCountSection = z.object({
  type: z.literal("titleCheckCount"),
  data: z.object({
    title: z.string(),
    count: z.number(),
    isChecked: z.boolean(),
  }),
});
const VendorCardSection = z.object({
  type: z.literal("vendor-card"),
  data: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      isChecked: z.boolean(),
      materials: z.array(z.string()),
    })
  ),
});

const ProductCardSection = z.object({
  type: z.literal("productCard"),
  data: z.array(
    z.object({
      name: z.string(),
      image: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

const PoliciesSection = z.object({
  type: z.literal("policies-card"),
  data: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ),
});

// Section: Title with Right and bottom details and cross
const TitleWithDetailsCrossSection = z.object({
  type: z.literal("title-with-details-cross"),
  data: z.object({
    title: z.string(),
    description: z.string().optional(),
    details: z
      .object({
        label: z.string().optional(),
        value: z.string().optional(),
        icon: z.enum(["database", "pencil"]).optional(),
        isEdit: z.boolean().optional(),
      })
      .optional(),
  }),
});

// Section: Select
const SelectKeys = ["product-package", "supervisor-production"] as const;
const SelectSection = z.object({
  type: z.literal("select"),
  data: z.object({
    placeholder: z.string(),
    label: z.string(),
    key: z.enum(SelectKeys).optional(),
    options: z.array(z.string()).optional(),
  }),
});

const OptionListSection = z.object({
  type: z.literal("optionList"),
  data: z.object({
    isCheckEnable: z.boolean().optional(),
    isSupervisorProduction: z.boolean().optional(),
    route: z.enum(["state", "city", "product", "chamber"]).optional(),
    options: z.union([
      z.array(z.string()),
      z.array(z.object({ name: z.string(), isoCode: z.string() })),
    ]),
    key: z
      .union([
        z.enum([
          "user-action",
          "vendor-action",
          "supervisor-production",
          "product-package",
        ]),
        z.string(),
      ])
      .optional(),
  }),
});

const AddonInputSection = z.object({
  type: z.literal("addonInput"),
  hasUniqueProp: z
    .object({ key: z.string(), identifier: z.string() })
    .optional(),
  conditionKey: z.enum(["hideUntilChamberSelected"]).optional(),
  data: z.object({
    placeholder: z.string(),
    label: z.string(),
    value: z.string(),
    addonText: z.string(),
    formField: z.string().optional(),
  }),
});

const FileUploadSection = z.object({
  type: z.literal("file-upload"),
  data: z.object({
    label: z.string(),
    title: z.string(),
    key: z.string(),
    uploadedTitle: z.string().optional(),
  }),
});

// const PackageSummarySection = z.object({
//   type: z.literal("packing-summary"),
//   data: z.object({
//     title: z.string(),
//     sizes: z.array(
//       z.object({
//         id: z.string(),
//         size: z.string(),
//         // bags: z.number(),
//         packets: z.number(),
//         rating: z.number(),
//       })
//     ),
//   }),
// });

const SkuSummaryMetric = z.object({
  id: z.string(),
  label: z.string(),
  type: z.literal("sku-summary"),
  bags: z.number(),
  packets: z.number(),
});

const NormalMetric = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  icon: z.enum(["box", "roll", "clock"]).optional(),
});

export const PackageSummarySection = z.object({
  type: z.literal("packing-summary"),
  data: z.object({
    title: z.string(),
    rating: z.number(),
    metrics: z.array(z.union([NormalMetric, SkuSummaryMetric])),

    breakdown: z
      .array(
        z.object({
          label: z.string(),
          metrics: z.array(
            z.object({
              label: z.string(),
              value: z.number(),
              unit: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
  }),
});

// ------------------- Section Union ------------------- //
const ButtonSchema = z.object({
  text: z.string(),
  variant: z.enum(["outline", "fill", "ghost"]),
  disabled: z.boolean().optional(),
  color: z.enum(["red", "green", "blue", "yellow"]),
  alignment: z.enum(["full", "half", "left", "right"]),
});

const StorageRMRatingSection = z.object({
  type: z.literal("storage-rm-rating"),
  data: z.array(
    z.object({
      rating: z.string(),
      message: z.string(),
    })
  ),
});

// ------------------- Bottom Sheet Configs ------------------- //

export const OrderReadyBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      DataSection,
      ProductListSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const PackageComesToEndBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      TitleWithTagSection,
      AddressSection,
      InputSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const VerifyMaterialBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      FullWidthImageSection,
      RatingSection,
      DataAccordianSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ProductionStartedBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      FullWidthImageSection,
      RatingSection,
      DataAccordianSection,
      FullWidthSliderSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const EditOrderBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      DataSection,
      ProductListSection,
    ])
  ),
});

export const WorkerBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [HeaderSection, DataSection, TableSection])
  ),
});

export const OrderShippedBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      ProductDtailsSection,
      TruckFullDetailsSection,
      ProductListAccoridanSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const OrderReachedBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      ProductDtailsSection,
      TruckFullDetailsSection,
      ProductListAccoridanSection,
    ])
  ),
});

export const RawMaterialBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [HeaderSection, DataGroupSection])
  ),
});

export const RawMaterialOrderedBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [HeaderSection, DataGroupSection])
  ),
});

export const AddRawMaterialBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      ProductCardSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const AddProductBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      OptionListSection,
    ])
  ),
});

export const AddVendorBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      TitleCheckCountSection,
      VendorCardSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ProductCompletedBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      DataSection,
      ImageGallerySection,
    ])
  ),
});

export const LaneOccupiedBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      DataSection,
      FullWidthImageSection,
    ])
  ),
});

export const CancelOrderBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      DescriptionSection,
      ProductDtailsSection,
      TruckFullDetailsSection,
      ProductListAccoridanSection,
    ])
  ),
});

export const FilterBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [TitleWithCheckboxSection, OptionListSection])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const SupervisorProductionBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SelectSection,
      InputWithSelectSection,
      AddonInputSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ChamberListBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [OptionListSection])),
  buttons: z.array(ButtonSchema).optional(),
});

export const MultipleChamberListBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      ProductCardSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const FillPackageBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [TitleWithDetailsCrossSection, InputSection])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const AddPorductPackageBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      InputSection,
      InputWithSelectSection,
      SelectSection,
      FileUploadSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const AddPackageBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      InputSection,
      InputWithSelectSection,
      SelectGroupSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const PackageWeightBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [manageActionSection])),
});
export const RatingBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [manageActionSection])),
});

export const CountryBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      SearchSection,
      IconTitleWithHeadingSection,
    ])
  ),
});

export const StateBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      SearchSection,
      OptionListSection,
    ])
  ),
});

export const CityBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      HeaderSection,
      SearchSection,
      OptionListSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ChooseProductBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      ProductCardSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ChoosePackageBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      PackagingSizeSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const UpcomingOrderBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      DataSection,
      ProductListSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const VehicleTypeBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [OptionListSection])),
});

export const RoleBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [OptionListSection])),
});

export const InProgressOrderBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      ProductDtailsSection,
      TruckFullDetailsSection,
      ProductListAccoridanSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ImagePreviewBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      ImagePreviewSection,
      FullWidthSliderSection,
    ])
  ),
});

export const CalendarEventBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [HeaderSection, DataGroupSection])
  ),
});

export const ScheduledCalendarEventBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [HeaderSection, DataGroupSection])
  ),
});

export const UserActionBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      OptionListSection,
    ])
  ),
});

export const StorageRMRatingConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      StorageRMRatingSection,
    ])
  ),
});

export const PoliciesBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      PoliciesSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const PackageTypeBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [OptionListSection])),
  buttons: z.array(ButtonSchema).optional(),
});

export const PackingSummaryBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [HeaderSection, PackageSummarySection])
  ),
});

export const MultipleProductBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      SearchSection,
      MultipleProductSection,
    ])
  ),
  buttons: z.array(ButtonSchema).optional(),
});

export const ChooseExportTypeBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      OptionListSection,
    ]),
  ),
});

export const ChooseExportFormatBottomSheetConfigSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("type", [
      TitleWithDetailsCrossSection,
      OptionListSection,
    ]),
  ),
});

export const ExportDataOptionsBottomSheetConfigSchema = z.object({
  sections: z.array(z.discriminatedUnion("type", [HeaderSection, DataSection])),
  buttons: z.array(ButtonSchema).optional(),
});

// ------------------- Type Inference ------------------- //

export type OrderReadyBottomSheetConfig = z.infer<
  typeof OrderReadyBottomSheetConfigSchema
>;
export type PackageComesToEndBottomSheetConfig = z.infer<
  typeof PackageComesToEndBottomSheetConfigSchema
>;
export type VerifyMaterialBottomSheetConfig = z.infer<
  typeof VerifyMaterialBottomSheetConfigSchema
>;
export type ProductionStartedBottomSheetConfig = z.infer<
  typeof ProductionStartedBottomSheetConfigSchema
>;
export type RawMaterialBottomSheetConfig = z.infer<
  typeof RawMaterialBottomSheetConfigSchema
>;
export type RawMaterialOrderedBottomSheetConfig = z.infer<
  typeof RawMaterialOrderedBottomSheetConfigSchema
>;
export type AddRawMaterialBottomSheetConfig = z.infer<
  typeof AddRawMaterialBottomSheetConfigSchema
>;
export type AddProductBottomSheetConfig = z.infer<
  typeof AddProductBottomSheetConfigSchema
>;
export type AddVendorBottomSheetConfig = z.infer<
  typeof AddVendorBottomSheetConfigSchema
>;
export type EditOrderBottomSheetConfig = z.infer<
  typeof EditOrderBottomSheetConfigSchema
>;
export type WorkerBottomSheetConfig = z.infer<
  typeof WorkerBottomSheetConfigSchema
>;
export type OrderShippedBottomSheetConfig = z.infer<
  typeof OrderShippedBottomSheetConfigSchema
>;
export type OrderReachedBottomSheetConfig = z.infer<
  typeof OrderReachedBottomSheetConfigSchema
>;
export type ProductCompletedBottomSheetConfig = z.infer<
  typeof ProductCompletedBottomSheetConfigSchema
>;
export type LaneOccupiedBottomSheetConfig = z.infer<
  typeof LaneOccupiedBottomSheetConfigSchema
>;
export type CancelOrderBottomSheetConfig = z.infer<
  typeof CancelOrderBottomSheetConfigSchema
>;
export type FilterBottomSheetConfig = z.infer<
  typeof FilterBottomSheetConfigSchema
>;
export type SupervisorProductionBottomSheetConfig = z.infer<
  typeof SupervisorProductionBottomSheetConfigSchema
>;
export type ChamberListBottomSheetConfig = z.infer<
  typeof ChamberListBottomSheetConfigSchema
>;
export type MultipleChamberListBottomSheetConfig = z.infer<
  typeof MultipleChamberListBottomSheetConfigSchema
>;
export type FillPackageBottomSheetConfig = z.infer<
  typeof FillPackageBottomSheetConfigSchema
>;
export type AddPackageBottomSheetConfig = z.infer<
  typeof AddPackageBottomSheetConfigSchema
>;
export type PackageWeightBottomSheetConfig = z.infer<
  typeof PackageWeightBottomSheetConfigSchema
>;
export type RatingBottomSheetConfig = z.infer<
  typeof RatingBottomSheetConfigSchema
>;
export type CountryBottomSheetConfig = z.infer<
  typeof CountryBottomSheetConfigSchema
>;
export type StateBottomSheetConfig = z.infer<
  typeof StateBottomSheetConfigSchema
>;
export type CityBottomSheetConfig = z.infer<typeof CityBottomSheetConfigSchema>;
export type ChooseProductBottomSheetConfig = z.infer<
  typeof ChooseProductBottomSheetConfigSchema
>;
export type ChoosePackageBottomSheetConfig = z.infer<
  typeof ChoosePackageBottomSheetConfigSchema
>;
export type UpcomingOrderBottomSheetConfig = z.infer<
  typeof UpcomingOrderBottomSheetConfigSchema
>;
export type vehicleTypeBottomSheetConfig = z.infer<
  typeof VehicleTypeBottomSheetConfigSchema
>;
export type RoleBottomSheetConfig = z.infer<typeof RoleBottomSheetConfigSchema>;
export type InProgressOrderBottomSheetConfig = z.infer<
  typeof InProgressOrderBottomSheetConfigSchema
>;
export type ImagePreviewBottomSheetConfig = z.infer<
  typeof ImagePreviewBottomSheetConfigSchema
>;
export type CalendarEventBottomSheetConfig = z.infer<
  typeof CalendarEventBottomSheetConfigSchema
>;
export type ScheduledCalendarEventBottomSheetConfig = z.infer<
  typeof ScheduledCalendarEventBottomSheetConfigSchema
>;
export type UserActionBottomSheetConfig = z.infer<
  typeof UserActionBottomSheetConfigSchema
>;
export type StorageRMRatingConfig = z.infer<typeof StorageRMRatingConfigSchema>;
export type PoliciesBottomSheetConfig = z.infer<
  typeof PoliciesBottomSheetConfigSchema
>;
export type PackageTypeBottomSheetConfig = z.infer<
  typeof PackageTypeBottomSheetConfigSchema
>;
export type PackingSummaryBottomSheetConfig = z.infer<
  typeof PackingSummaryBottomSheetConfigSchema
>;
export type MultipleProductBottomSheetConfig = z.infer<
  typeof MultipleProductBottomSheetConfigSchema
>;
export type ChooseExportTypeBottomSheetConfig = z.infer<
  typeof ChooseExportTypeBottomSheetConfigSchema
>;
export type ChooseExportFormatBottomSheetConfig = z.infer<
  typeof ChooseExportFormatBottomSheetConfigSchema
>;
export type ExportDataOptionsBottomSheetConfig = z.infer<
  typeof ExportDataOptionsBottomSheetConfigSchema
>;

// ------------------- Central Schema Registry ------------------- //
export const bottomSheetSchemas = {
  "order-ready": OrderReadyBottomSheetConfigSchema,
  "package-comes-to-end": PackageComesToEndBottomSheetConfigSchema,
  "verify-material": VerifyMaterialBottomSheetConfigSchema,
  "production-start": ProductionStartedBottomSheetConfigSchema,
  "raw-material-reached": RawMaterialBottomSheetConfigSchema,
  "raw-material-ordered": RawMaterialOrderedBottomSheetConfigSchema,
  "add-raw-material": AddRawMaterialBottomSheetConfigSchema,
  "add-product": AddProductBottomSheetConfigSchema,
  "add-vendor": AddVendorBottomSheetConfigSchema,
  "edit-order": EditOrderBottomSheetConfigSchema,
  "worker-single": WorkerBottomSheetConfigSchema,
  "worker-multiple": WorkerBottomSheetConfigSchema,
  "order-shipped": OrderShippedBottomSheetConfigSchema,
  "order-reached": OrderReachedBottomSheetConfigSchema,
  "production-completed": ProductCompletedBottomSheetConfigSchema,
  "lane-occupied": LaneOccupiedBottomSheetConfigSchema,
  "cancel-order": CancelOrderBottomSheetConfigSchema,
  filter: FilterBottomSheetConfigSchema,
  "supervisor-production": SupervisorProductionBottomSheetConfigSchema,
  "chamber-list": ChamberListBottomSheetConfigSchema,
  "multiple-chamber-list": MultipleChamberListBottomSheetConfigSchema,
  "fill-package": FillPackageBottomSheetConfigSchema,
  "add-product-package": AddPorductPackageBottomSheetConfigSchema,
  "add-package": AddPackageBottomSheetConfigSchema,
  "package-weight": PackageWeightBottomSheetConfigSchema,
  country: CountryBottomSheetConfigSchema,
  state: StateBottomSheetConfigSchema,
  city: CityBottomSheetConfigSchema,
  "choose-product": ChooseProductBottomSheetConfigSchema,
  "choose-package": ChoosePackageBottomSheetConfigSchema,
  "upcoming-order": UpcomingOrderBottomSheetConfigSchema,
  "vehicle-type": VehicleTypeBottomSheetConfigSchema,
  "in-progress-order": InProgressOrderBottomSheetConfigSchema,
  "image-preview": ImagePreviewBottomSheetConfigSchema,
  rating: RatingBottomSheetConfigSchema,
  "select-role": RoleBottomSheetConfigSchema,
  "calendar-event-scheduled": CalendarEventBottomSheetConfigSchema,
  "scheduled-date-event": ScheduledCalendarEventBottomSheetConfigSchema,
  "user-action": UserActionBottomSheetConfigSchema,
  "storage-rm-rating": StorageRMRatingConfigSchema,
  "select-policies": PoliciesBottomSheetConfigSchema,
  "select-package-type": PackageTypeBottomSheetConfigSchema,
  "packing-summary": PackingSummaryBottomSheetConfigSchema,
  "multiple-product-card": MultipleProductBottomSheetConfigSchema,
  "choose-export-type": ChooseExportTypeBottomSheetConfigSchema,
  "choose-export-format": ChooseExportFormatBottomSheetConfigSchema,
  "export-data-options": ExportDataOptionsBottomSheetConfigSchema,
} as const;

export type BottomSheetSchemaKey = keyof typeof bottomSheetSchemas;

export type BottomSheetData = z.infer<
  (typeof bottomSheetSchemas)[BottomSheetSchemaKey]
>;