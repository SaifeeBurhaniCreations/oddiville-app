const ORDER_READY = {
    sections: [
        {
            type: 'header',
            data: { label: 'Order ready', title: "", value: "", icon: 'calendar', description: "", color: "red" },
        },
        {
            type: 'data',
            data: [
                {
                    title: "Product detail",
                    details: [
                        {
                            row_1: [
                                // {
                                //     label: "Amount",
                                //     value: "",
                                //     icon: "money",
                                // },
                                {
                                    label: "Product",
                                    value: "",
                                    icon: "box",
                                },
                                {
                                    label: "Quantity",
                                    value: "",
                                    icon: "database",
                                },
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "Dis Date",
                                    value: "",
                                    icon: "calendar-check",
                                },
                            ]
                        },
                        {
                            row_3: [
                                {
                                    label: "Created By",
                                    value: "",
                                    icon: "user",
                                },
                            ]
                        },
                    ],
                },
            ],
        },
        {
            type: 'product-list',
            data: {
                label: "Products",
                detailView: {
                    text: "Show detail view",
                    isDetailView: false,
                },
                products: [
                    {
                        title: "",
                        image: "box",
                        // packages: [
                        //     { size: null, unit: '', quantity: '' },
                        // ],
                        chambers: [
                            { id: '', name: '', quantity: '' }
                        ],
                        description: "",
                        // packagesSentence: "",
                        weight: "",
                        price: ""
                    },
                ]
            }
        },
    ],
    buttons: [
        { text: 'Shipped order', variant: 'outline', color: 'green', alignment: "full", disabled: false, actionKey: "ship-order" },
    ],
}

const ORDER_SHIPPED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Order shipped', title: "", value: "", icon: 'calendar', color: "yellow" },
        },
        {
            type: 'product-details',
            data: [
                {
                    title: "Product detail",
                    details: [
                        {
                            row_1: [
                                // {
                                //     label: "Amount",
                                //     value: "",
                                //     icon: "money",
                                // },
                                {
                                    label: "Product",
                                    value: "",
                                    icon: "box",
                                },
                                {
                                    label: "Quantity",
                                    value: "",
                                    icon: "database",
                                },
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "Dis Date",
                                    value: "",
                                    icon: "calendar-check",
                                },
                            ]
                        },
                        {
                            row_3: [
                                {
                                    label: "Dispatched By",
                                    value: "",
                                    icon: "user",
                                },
                            ]
                        },
                    ],
                    fileName: "example_challan.pdf",
                },
            ],

        },
        {
            type: 'truck-full-details',
            data: {
                title: "Truck Detail",
                driverName: "",
                driverImage: "",
                number: "",
                type: "",
                date_title: "Est. Delivered date",
                arrival_date: "",
                agency: "",
            }
        },
        {
            type: 'product-list-accordian',
            data: {
                label: "Products",
                detailView: {
                    text: "Show detail view",
                    isDetailView: false,
                },
                products: [
                    {
                        title: "",
                        image: "",
                        // packages: [
                        //     { size: "", unit: '', quantity: '' },
                        // ],
                        chambers: [
                            { name: '', quantity: '' }
                        ],
                        description: "",
                        // packagesSentence: "",
                        weight: "",
                        price: ""
                    },
                ]
            }
        },
    ],
    buttons: [
        { text: 'Order reached', variant: 'fill', color: 'green', alignment: "full", disabled: false, actionKey: 'order-reached' },
        { text: 'Cancel order', variant: 'ghost', color: 'green', alignment: "half", disabled: true, actionKey: 'cancel-order' },
        { text: 'Change truck', variant: 'ghost', color: 'green', alignment: "half", disabled: true, actionKey: '' },
    ],
}

const ORDER_REACHED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Order reached', title: '', value: '', icon: 'calendar', description: "", color: "green" },
        },
        {
            type: 'product-details',
            data: [
                {
                    title: "Product detail",
                    details: [
                        {
                            row_1: [
                                // {
                                //     label: "Amount",
                                //     value: "",
                                //     icon: "money",
                                // },
                                {
                                    label: "Product",
                                    value: "",
                                    icon: "box",
                                },
                                {
                                    label: "Quantity",
                                    value: "",
                                    icon: "database",
                                },
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "Dis Date",
                                    value: "",
                                    icon: "calendar-check",
                                },
                            ]
                        },
                    ],
                    fileName: "",
                },
            ],

        },
        {
            type: 'truck-full-details',
            data: {
                title: "",
                driverName: "",
                driverImage: "",
                number: "",
                type: "",
                date_title: "Arrival date",
                arrival_date: "",
                agency: "",
            }
        },
        {
            type: 'product-list-accordian',
            data: {
                label: "Products",
                products: [
                    {
                        title: "",
                        image: "",
                        // packages: [
                        //     { size: "", unit: '', quantity: '' },
                        // ],
                        chambers: [
                            { name: '', quantity: '' }
                        ],
                        description: "",
                        // packagesSentence: "",
                        weight: "",
                        price: ""
                    },
                ]
            }
        },
    ],

}

const PACKAGE_COMES_TO_END = {
    sections: [
        {
            type: 'header',
            data: { label: 'Package comes to end', title: "", value: "", icon: 'calendar', description: '' },
        },
        {
            type: 'input',
            data: {
                placeholder: 'Enter counts', label: 'Add package', keyboardType: 'number-pad'
            },
        },
    ],
    buttons: [
        { text: 'Update package', variant: 'fill', color: 'green', alignment: "full", disabled: false },
    ],
}

const EDIT_ORDER = {
    sections: [
        {
            type: 'header',
            data: { label: 'Edit order', title: "", value: "", icon: 'calendar' },
        },
        {
            type: 'data',
            data: [
                {
                    title: "New detail",
                    details: [
                        {
                            row_1: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "location",
                                }
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "box",
                                }
                            ]
                        },
                        {
                            row_3: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "calendar-check",
                                }
                            ]
                        },
                        {
                            row_4: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "chamber",
                                }
                            ]
                        },
                    ],
                },
                {
                    title: "Old detail",
                    details: [
                        {
                            row_1: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "location",
                                }
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "box",
                                }
                            ]
                        },
                        {
                            row_3: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "calendar-check",
                                }
                            ]
                        },
                        {
                            row_4: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "chamber",
                                }
                            ]
                        },
                    ],
                },
            ],
        },
    ],
};

const RAW_MATERIAL_REACHED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Raw material reached', title: "", value: "", icon: 'calendar', color: "green" },
        },
        {
            type: 'data-group',
            data: [
                {
                    title: "Product Details", details: [
                        { label: "", value: "", icon: "database" },
                        { label: "", value: "", icon: "database" },
                        { label: "", value: "", icon: "money" },
                        { label: "", value: "", icon: "box" }
                    ],
                    fileName: "Challan"
                },
                {
                    title: "Vendor detail", details: [
                        { label: "", value: "", icon: "user" },
                        { label: "", value: "", icon: "location" },
                        { label: "", value: "", icon: "calendar-check" },
                    ],
                },
                {
                    title: "Truck detail",
                    details: [
                        { label: "", value: "", icon: "truck-num" },
                        { label: "", value: "", icon: "location" },
                        { label: "", value: "", icon: "clock" },
                    ],
                },
            ],
        },
    ]
};

const RAW_MATERIAL_ORDERED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Raw material ordered', title: "", value: "", icon: 'calendar', color: "red" },
        },
        {
            type: 'data-group',
            data: [
                {
                    title: "Product Details", details: [
                        { label: "", value: "", icon: "database" },
                        { label: "", value: "", icon: "money" },
                        { label: "", value: "", icon: "user" },
                    ],
                },
                {
                    title: "Vendor detail", details: [
                        { label: "", value: "", icon: "user" },
                        { label: "", value: "", icon: "location" },
                        { label: "", value: "", icon: "calendar-check" },
                    ],
                },
            ],
        },
    ]
};

const ADD_RAW_MATERIAL = {
    sections: [
        {
            type: 'title-with-details-cross',
            data: {
                title: "Add raw materials"
            },
        },
        {
            type: 'search',
            data: { searchTerm: '', placeholder: "Search raw material", searchType: "add-raw-material" },
        },
        {
            type: 'productCard',
            data: [
                { name: '', image: '', description: '' },
            ]
        },
    ],
    buttons: [
        { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false, actionKey: 'cancel' },
        { text: 'Add', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: 'add-raw-material' },
    ],
};

const ADD_PRODUCT = {
    sections: [
        {
            type: 'title-with-details-cross',
            data: {
                title: "Add Products"
            },
        },
        {
            type: 'search',
            data: { searchTerm: '', placeholder: "Search Product", searchType: "add-product" },
        },
        {
            type: 'optionList',
            data: {
                isCheckEnable: false,
                route: "product",
                options: []
            }
        },
    ]
};

const PRODUCTION_COMPLETED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Product Completed', title: "", value: "", icon: 'calendar', color: "green" },
        },
        {
            type: 'data',
            data: [
                {
                    title: "Production detail",
                    details: [
                        {
                            row_1: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "user",
                                },
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "color-swatch",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "trash",
                                }
                            ]
                        },
                        {
                            row_3: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "lane",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "box",
                                },
                            ]
                        },
                        {
                            row_4: [
                               {
                                    label: "",
                                    value: "",
                                    icon: "calendar-year",
                                }
                            ]
                        },
                    ],
                },
            ],
        },
        {
            type: 'image-gallery',
            data: [],
        },
    ],
};

const PACKING_SUMMARY = {
    sections: [
        {
            type: 'header',
            data: { label: 'Packing Summary', title: "", value: "", icon: 'calendar', color: "green" },
        },
        {
            type: 'data',
            data: [
                {
                    title: "Production detail",
                    details: [
                        {
                            row_1: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "user",
                                },
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "color-swatch",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "trash",
                                }
                            ]
                        },
                        {
                            row_3: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "lane",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "box",
                                },
                            ]
                        },
                        {
                            row_4: [
                               {
                                    label: "",
                                    value: "",
                                    icon: "calendar-year",
                                }
                            ]
                        },
                    ],
                },
            ],
        },
        {
            type: 'image-gallery',
            data: [],
        },
    ],
};

const LANE_OCCUPIED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Lane occupied', title: "", value: "", icon: 'calendar', color: "yellow" },
        },
        {
            type: 'data',
            data: [
                {
                    title: "Production detail",
                    details: [
                        {
                            row_1: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "user",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "star",
                                }
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "database",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "color-swatch",
                                }
                            ]
                        }
                    ],
                },
            ],
        },
        {
            type: 'image-full-width',
            data: { imageUrl: "" },
        },
    ],
};

const WORKER_ARRIVED_SINGLE = {
    sections: [
        {
            type: 'header',
            data: { label: 'Worker arrived', title: "", value: "", icon: 'calendar', color: "green" },
        },
        {
            type: 'data',
            data: [
                {
                    title: "Vendor detail",
                    details: [
                        {
                            row_1: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "user",
                                }
                            ]
                        },
                        {
                            row_2: [
                                {
                                    label: "",
                                    value: "",
                                    icon: "male",
                                },
                                {
                                    label: "",
                                    value: "",
                                    icon: "female",
                                }
                            ]
                        },
                    ],
                },
            ],
        },
        {
            type: 'table',
            data: [
                {
                    tableHeader: [
                        { label: "", key: "" },
                        { label: "", key: "" },
                        { label: "", key: "" },
                    ],

                    tableBody: [
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" }
                    ]
                },
            ]
        }
    ]
}

const WORKER_ARRIVED_MULTIPLE = {
    sections: [
        {
            type: 'header',
            data: {
                label: 'Worker arrived', title: "", value: "", icon: 'calendar', color: "green", headerDetails: [
                    {
                        label: '',
                        value: '',
                        icon: 'male'
                    },
                    {
                        label: '',
                        value: '',
                        icon: 'female'
                    }
                ]
            },
        },
        {
            type: 'table',
            data: [
                {
                    label: "",
                    tableHeader: [
                        { label: "", key: "" },
                        { label: "", key: "" },
                        { label: "", key: "" },
                    ],

                    tableBody: [
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                    ]
                },
                {
                    label: "",
                    tableHeader: [
                        { label: "", key: "" },
                        { label: "", key: "" },
                        { label: "", key: "" },
                    ],

                    tableBody: [
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                        { location: "", countMale: "", countFemale: "" },
                    ]
                },
            ]
        }
    ]
}

const ADD_VENDOR = {
    sections: [
        {
            type: 'title-with-details-cross',
            data: {
                title: "Add vendor"
            },
        },
        {
            type: 'search',
            data: { searchTerm: '', placeholder: "Search vendor by name" }
        },
        // {
        //   type: 'titleCheckCount',
        //   data: { title: 'Select all', count: 5, isChecked: false },
        // },
        {
            type: 'vendor-card',
            data: [
                { id: "", name: '', address: '', isChecked: false, materials: [] },
            ],
        },
    ],
    buttons: [
        { text: 'Add vendor', variant: 'fill', color: 'green', alignment: "full", disabled: false },
    ],
};

const CHAMBER_LIST = {
    sections: [
        {
            type: 'optionList',
            data: {
                isCheckEnable: false,
                route: "chamber",
                options: []
            }
        },
    ]
};

const MULTIPLE_CHAMBER_LIST = {
    sections: [
        {
            type: 'title-with-details-cross',
            data: {
                title: "Select Chambers"
            },
        },
        {
            type: 'productCard',
            data: [
                { name: '', image: '' },
            ]
        },
    ],
    buttons: [
        { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false, actionKey: 'cancel' },
        { text: 'select', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: 'choose-chamber' },
    ],
};

const COUNTRY = {
    sections: [
        {
            type: 'header',
            data: { label: '', title: "Country", value: "", icon: 'calendar', color: "green" },
        },
        {
            type: 'search',
            data: { searchTerm: '', placeholder: "Search country", searchType: 'country' }
        },
        {
            type: 'icon-title-with-heading',
            data: []
        },

    ],
};

const STATES = {
    sections: [
        {
            type: 'header',
            data: { label: '', title: "State", value: "", icon: 'calendar', color: "green" },
        },
        {
            type: 'search',
            data: { searchTerm: '', placeholder: "Search state", searchType: 'state' }
        },
        {
            type: 'optionList',
            data: {
                isCheckEnable: false,
                isSupervisorProduction: false,
                route: "state",
                options: []
            }
        },
    ],
};

const CITIES = {
    sections: [
        {
            type: 'header',
            data: { label: '', title: "City", value: "", icon: 'calendar', color: "green" }
        },
        {
            type: 'search',
            data: { searchTerm: '', placeholder: "Search city", searchType: 'city' }
        },
        {
            type: 'optionList',
            data: {
                isCheckEnable: false,
                isSupervisorProduction: false,
                route: "city",
                options: [],
            }
        },
    ],
};

const PRODUCTION_STARTED = {
    sections: [
        {
            type: 'header',
            data: { label: 'Production Start', title: "", value: "", icon: 'calendar', color: "red" },
        },
        {
            type: 'image-full-width',
            data: { imageUrl: "" },
        },
        {
            type: 'rating',
            data: { label: "Rating", selected: 0 },
        },
        {
            type: 'data-accordian',
            data: [
                {
                    title: "Product detail", details: [
                        { label: "", value: "", icon: "database" },
                        { label: "", value: "", icon: "database" }
                    ],
                    fileName: ["example_challan.pdf"],
                },
            ],
        },
    ]
}

const CALENDAR_EVENT_SCHEDULED = {
  sections: [
    {
      type: "header",
      data: {
        label: "Calendar Event",
        title: "",
        value: "",
        icon: "calendar",
        color: "red",
      },
    },
    {
      type: "data-group",
      data: [
        {
          title: "Event Details",
          details: [
            { label: "", value: "", icon: "box" },
            { label: "", value: "", icon: "lane" },
          ],
        },
      ],
    },
  ],
};

const SCHEDULED_DATE_EVENT = {
  sections: [
    {
      type: "header",
      data: {
        label: "Scheduled Date Event",
        title: "",
        value: "",
        icon: "calendar",
        color: "green",
      },
    },
    {
      type: "data-group",
      data: [
        {
          title: "Event Details",
          details: [
            { label: "", value: "", icon: "box" },
            { label: "", value: "", icon: "lane" },
          ],
        },
        {
          title: "Time Details",
          details: [
            { label: "", value: "", icon: "clock" },
            { label: "", value: "", icon: "clock" },
          ],
        },
      ],
    },
  ],
};

module.exports = {
  ORDER_READY,
  ORDER_REACHED,
  PACKAGE_COMES_TO_END,
  EDIT_ORDER,
  RAW_MATERIAL_REACHED,
  RAW_MATERIAL_ORDERED,
  ADD_RAW_MATERIAL,
  LANE_OCCUPIED,
  WORKER_ARRIVED_SINGLE,
  WORKER_ARRIVED_MULTIPLE,
  ADD_VENDOR,
  CHAMBER_LIST,
  MULTIPLE_CHAMBER_LIST,
  COUNTRY,
  STATES,
  CITIES,
  ADD_PRODUCT,
  ORDER_SHIPPED,
  PRODUCTION_STARTED,
  PRODUCTION_COMPLETED,
  CALENDAR_EVENT_SCHEDULED,
  SCHEDULED_DATE_EVENT,
  PACKING_SUMMARY,
};