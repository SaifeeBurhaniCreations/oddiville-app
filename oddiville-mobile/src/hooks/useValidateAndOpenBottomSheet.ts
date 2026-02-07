import { useDispatch, useSelector } from 'react-redux';
import { openBottomSheet } from '@/src/redux/slices/bottomsheet.slice';
import { BottomSheetSchemaKey, bottomSheetSchemas, UpcomingOrderBottomSheetConfig } from '@/src/schemas/BottomSheetSchema';
import { queryClient } from '@/src/lib/react-query';
import { getBottomSheetQueryOptions } from './queries/getBottomSheetQueryOptions';
import { formatDistanceToNow } from 'date-fns';
import { getBottomSheetActions } from '../utils/bottomSheetActions';
import { ButtonConfig } from '../types';
import { RootState } from '../redux/store';
import { countries } from '../constants/countries';
import { Chamber, useDryChambers } from './useChambers';

const useValidateAndOpenBottomSheet = () => {
  const dispatch = useDispatch();
  const { packages } = useSelector((state: RootState) => state.packageSizePackaging);

  const { product } = useSelector((state: RootState) => state.storeProduct);
  const selectedChambers = useSelector((state: RootState) => state.rawMaterial.selectedChambers);
    const packageTypeProduction = useSelector((state: RootState) => state.packageTypeProduction.selectedPackageType);

  const { data: DryChambersRaw } = useDryChambers()
  const DryChambers = DryChambersRaw || [];

  const editOrder = {
    sections: [
      {
        type: 'header',
        data: { label: 'Edit order', title: "Vikram Patel", value: formatDistanceToNow(new Date(Date.now() - 1 * 60 * 1000), { addSuffix: true }), icon: 'calendar' },
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
                    label: "Address",
                    value: "18, Commercial Street, Bangalore – 560001",
                    icon: "location",
                  }
                ]
              },
              {
                row_2: [
                  {
                    label: "Product",
                    value: "French fries",
                    icon: "box",
                  }
                ]
              },
              {
                row_3: [
                  {
                    label: "Est dispatch date",
                    value: "Jun 12, 2025",
                    icon: "calendar-check",
                  }
                ]
              },
              {
                row_4: [
                  {
                    label: "Chambers",
                    value: "1(20), 2(50), 6(10)",
                    icon: "chamber",
                  }
                ]
              },
              {
                row_5: [
                  {
                    label: "Package",
                    value: "500gm(60), 250gm(80), 1kg(10)",
                    icon: "package",
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
                    label: "Address",
                    value: "18, Commercial Street, Bangalore – 560001",
                    icon: "location",
                  }
                ]
              },
              {
                row_2: [
                  {
                    label: "Product",
                    value: "French fries",
                    icon: "box",
                  }
                ]
              },
              {
                row_3: [
                  {
                    label: "Est dispatch date",
                    value: "Jun 12, 2025",
                    icon: "calendar-check",
                  }
                ]
              },
              {
                row_4: [
                  {
                    label: "Chambers",
                    value: "1(20), 2(50), 6(10)",
                    icon: "chamber",
                  }
                ]
              },
              {
                row_5: [
                  {
                    label: "Package",
                    value: "500gm(60), 250gm(80), 1kg(10)",
                    icon: "package",
                  }
                ]
              },
            ],
          },
        ],
      },
    ]
  }

  const cancelOrder = {
    sections: [
      {
        type: 'header',
        data: { label: 'Cancel order', title: "Vikram Patel", value: formatDistanceToNow(new Date(Date.now() - 1 * 60 * 1000), { addSuffix: true }), icon: 'calendar', description: "18, Commercial Street, Bangalore – 560001" },
      },
      {
        type: 'description',
        data: { title: 'Reason', description: 'Due to some reason vendors cancelled the order.Due to some reason vendors cancelled the order.Due to some reason vendors cancelled the order.' }
      },
      {
        type: 'product-details',
        data: [
          {
            title: "Product detail",
            details: [
              {
                row_1: [
                  {
                    label: "Amount",
                    value: "50 lakhs",
                    icon: "money",
                  },
                  {
                    label: "Product",
                    value: "4 product",
                    icon: "box",
                  },
                ]
              },
              {
                row_2: [
                  {
                    label: "Quantity",
                    value: "4 Tons",
                    icon: "database",
                  },
                  {
                    label: "Dis Date",
                    value: "Nov 8, 2024",
                    icon: "calendar-check",
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
          driverName: "Rajesh Sharma",
          driverImage: "https://0b8cc32c66c8.ngrok-free.app/driver-image/driver-1.png",
          number: "MP09 AB 1234",
          type: "Chota hathi",
          date_title: "Arrival date",
          arrival_date: "Dec 8, 2024",
          agency: "Hans travels",
        }
      },
      {
        type: 'product-list-accordian',
        data: {
          label: "Products",
          products: [
            {
              title: "Mango",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Momos",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Mango",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Momos",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Mango",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Momos",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Mango",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
            {
              title: "Momos",
              image: "https://0b8cc32c66c8.ngrok-free.app/products/product-1.png",
              packages: [
                { size: 500, unit: 'gm', quantity: '' },
                { size: 250, unit: 'gm', quantity: '' },
                { size: 10, unit: 'kg', quantity: '' },
              ],
              chambers: [
                { id: '8d8ac610-566d-4ef0-9c22-186b2a5ed793', name: 'Chamber 1', quantity: '300' }
              ],
              description: "80 Kg in 3 chambers",
              packagesSentence: "150 package of 500gm, 250gm & 1kg",
              weight: "80 Kg",
              price: "10 Lakh"
            },
          ]
        }
      },
    ]
  }

  const packageComesToEnd = {
    sections: [
      {
        type: 'header',
        data: { label: 'Package comes to end', title: "250gm package", value: formatDistanceToNow(new Date(Date.now() - 1 * 60 * 1000), { addSuffix: true }), icon: 'calendar', description: 'India | 200 left' },
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

  const verifyMaterial = {
    sections: [
      {
        type: 'header',
        data: { label: 'Verify material', title: "Corn", value: formatDistanceToNow(new Date(Date.now() - 1 * 60 * 1000), { addSuffix: true }), icon: 'calendar' },
      },
      {
        type: 'image-full-width',
        data: { imageUrl: "https://0b8cc32c66c8.ngrok-free.app/sample-/sample-1.png" },
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
              { label: "Order", value: "6 Tons", icon: "database" },
              { label: "Recieved", value: "5 Tons", icon: "database" }
            ],
            fileName: "example_challan.pdf",
          },
          {
            title: "Vendor detail", details: [
              { label: "Name", value: "Vikram Patel", icon: "user" },
              { label: "Address", value: "18, Commercial Street, Bangalore – 560001", icon: "location" },
              { label: "Arrival date", value: "Jun 12, 2025", icon: "calendar-check" },
            ],
          },
          {
            title: "Truck detail",
            detailsA: [
              { label: "Name", value: "Rajesh sharma", icon: "user-square" },
              { label: "Type", value: "Eicher", icon: "truck" }
            ],
            detailsB: [
              { label: "Truck no", value: "MP09 BB 1234", icon: "truck-num" },
              { label: "Weight", value: "2 Tons", icon: "clock" }
            ],
          },
        ],
      },
    ],
    buttons: [
      { text: 'Verify', variant: 'fill', color: 'green', alignment: "full", disabled: false },
    ],
  }

  const filter = {
    sections: [
      {
        type: "titleWithCheckbox",
        data: {
          key: "vendor:overview",
          options: [
            {
              text: "Production pending",
              isChecked: true,
            },
            {
              text: "Rating pending",
              isChecked: true,
            },
          ]
        }
      },
      {
        type: 'optionList',
        data: {
          isCheckEnable: false,
          options: ["sample", "production"]
        }
      },
    ],
    buttons: [
      { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false, actionKey: "cancel" },
      { text: 'Clear', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: 'clear-filter' },
    ],
  }

  const supervisorProduction = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Store material', description: "Pick chambers to store your materials in", details: { label: "Quantity", value: `${product?.quantity} ${product?.unit}`, icon: "database" }
        },
      },
      {
        type: 'select',
        data: {
          placeholder: 'Select chambers', label: "Select chambers", key: "supervisor-production"
        },
      },
      ...selectedChambers.map(chamberName => ({
        type: 'input-with-select',
        conditionKey: 'hideUntilChamberSelected',
        hasUniqueProp: {
          identifier: 'addonInputQuantity',
          key: 'label'
        },
        data: {
          placeholder: 'Qty.',
          label: chamberName,
          label_second: "Rating",
          value: "",
          addonText: "Kg",
          key: "supervisor-production",
          formField_1: chamberName,
          source: "supervisor-production"
        },
      })),
      {
          type: "input-with-select",
          data: {
            placeholder: "Enter Size in kg",
            label: "Size (Kg)",
            placeholder_second: "Choose type",
            label_second: "Type",
            alignment: "half",
            value: packageTypeProduction ?? "pouch",
            key: "select-package-type",
            formField_1: "product_name",
            source: "add-product-package",
            source2: "product-package",
          },
        },
      {
        type: 'addonInput',
        conditionKey: 'hideUntilChamberSelected',
        data: {
          placeholder: 'Enter quantity',
          label: "Discard quantity",
          value: "",
          addonText: "Kg",
          formField: "discard_quantity"
        },
      }
    ],
    buttons: [
      { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false },
      { text: 'Store', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: 'store-product' },
    ],
  }

  const fillPackage = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Add package count', description: `${packages?.weight} • ${packages?.quantity} count`, details: { icon: "pencil" }
        },
      },
      {
        type: 'input',
        data: {
          placeholder: 'Enter counts', label: 'Add package', keyboardType: 'number-pad'
        },
      },
    ],
    buttons: [
      { text: 'Add', variant: 'fill', color: 'green', alignment: "full", disabled: false },
    ],
  }

  const addProductPackage = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: "Add Packing Material",
        },
      },
            {
          type: "input-with-select",
          data: {
            placeholder: "Enter Product",
            label: "Product name",
            placeholder_second: "Enter RM",
            label_second: "Raw Material",
            alignment: "half",
            key: "add-raw-material",
            formField_1: "product_name",
            source: "add-product-package",
            source2: "product-package",
          },
        },
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter SKU",
            label: "Packing Size",
            key: "package-weight",
            formField_1: "size",
            label_second: "Unit",
            keyboardType: "number-pad",
            source: "add-product-package",
          },
        },
                {
          type: "input",
          data: {
            placeholder: "Enter counts",
            label: "No. of Pouches",
            keyboardType: "number-pad",
            formField: "quantity",
          },
        },
      {
        type: "select",
        data: {
          placeholder: "Select Chamber",
          label: "Select Chamber",
          options: DryChambers.map((dch: Chamber) => dch.chamber_name),
          key: "product-package"
        },
      },
     {
          type: "file-upload",
          data: {
            label: "Upload pouch image",
            uploadedTitle: "Uploaded pouch image",
            title: "Upload pouch image",
            key: "package-image",
          },
        },
        {
          type: "file-upload",
          data: {
            label: "Upload packed image",
            uploadedTitle: "Uploaded packed image",
            title: "Upload packed image",
            key: "image",
          },
        },
    ],
    buttons: [
      { text: 'Add package', variant: 'fill', color: 'green', alignment: "full", disabled: false, actionKey: "add-product-package" },
    ],
  }

  const addPackage = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Add new size',
        },
      },
      {
        type: 'input-with-select',
        data: {
          placeholder: 'Enter title', label: 'Package title', key: "package-weight", formField_1: "size", label_second: 'Unit', source: "add-package"
        },
      },
      {
        type: 'input',
        data: {
          placeholder: 'Enter counts', label: 'Add package', keyboardType: 'number-pad', formField: "quantity"
        },
      },
    ],
    buttons: [
      { text: 'Add size', variant: 'fill', color: 'green', alignment: "full", disabled: false, actionKey: "add-package" },
    ],
  }

  const packageWeight = {
    sections: [
      {
        type: 'manageAction',
        data: [
          {
            title: "Gram",
            actionKey: "gm",
          },
          {
            title: "Kilogram",
            actionKey: "kg",
          },
          {
            title: "Null",
            actionKey: "null",
          },
          {
            title: "Quintal",
            actionKey: "qn",
          },
          {
            title: "Tons",
            actionKey: "tons",
          },
        ],
      },

    ]
  }

  const rating = {
    sections: [
      {
        type: 'manageAction',
        data: [
          { title: '5', actionKey: '5' },
          { title: '4', actionKey: '4' },
          { title: '3', actionKey: '3' },
          { title: '2', actionKey: '2' },
          { title: '1', actionKey: '1' },
        ]
      },
    ],
  };

  const choosePackaging = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Packaging size'
        },
      },
      {
        type: 'search',
        data: { searchTerm: '', placeholder: "Search size", searchType: "add-package" }
      },
      {
        type: 'package-size-choose-list',
        data: {
          list: [
          { name: '10gm', icon: "paper-roll", isChecked: false, },
          { name: '50gm', icon: "paper-roll", isChecked: false, },
          { name: '100gm', icon: "paper-roll", isChecked: false, },
          { name: '200gm', icon: "paper-roll", isChecked: false, },
          { name: '250gm', icon: "paper-roll", isChecked: false, },
          { name: '500gm', icon: "bag", isChecked: false, },
          { name: '1kg', icon: "bag", isChecked: false, },
          { name: '1.5kg', icon: "bag", isChecked: false, },
          { name: '2kg', icon: "bag", isChecked: false, },
          { name: '5kg', icon: "big-bag", isChecked: false, },
          { name: '10kg', icon: "big-bag", isChecked: false, },
          { name: '30kg', icon: "big-bag", isChecked: false, },
        ],
        source: "package"
        }
      },
    ],
    buttons: [
      { text: 'Add', variant: 'fill', color: 'green', alignment: "full", disabled: false, actionKey: "add-package-by-product" },
    ],
  }

  const vehicleType = {
    sections: [
      {
        type: 'optionList',
        data: {
          isCheckEnable: false,
          options: [
            "Eicher",
            "Chota hathi",
          ]
        }
      },
    ],
  };

  const chooseExportType = {
    sections: [
      {
        type: "optionList",
        data: {
          isCheckEnable: false,
          options: ["Dashboard", "Chamber", "Production", "Raw Material", "Dispatch"],
          key: "choose-export-type"
        },
      },
    ],
  };
  
  const chooseExportFormat = {
    sections: [
      {
        type: "optionList",
        data: {
          isCheckEnable: false,
          options: ["Excel (.xlsx)", "CSV (.csv)"],
          key: "choose-export-type",
        },
      },
    ],
  };

  const role = {
    sections: [
      {
        type: 'optionList',
        data: {
          isCheckEnable: false,
          options: [
            "admin",
            "supervisor",
          ]
        }
      },
    ],
  };

  const ImagePreview = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Example_challan'
        },
      },
      {
        type: 'image-preview',
        data: {
          imageUri: ""
        }
      },

    ]
  }

  const UserAction = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'User Actions'
        },
      },
      {
        type: 'optionList',
        data: {
          isCheckEnable: false,
          options: [
            "Edit User",
            "Delete User",
            // "Change Password",
          ],
          key: "user-action"
        }
        },
    ]
  }

  const storageRmRating = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Select rating'
        },
      },
      {
        type: 'storage-rm-rating',
        data: [
          {
          rating: "5",
          message: "Excellent",
        },
        {
          rating: "4",
          message: "Good",
        },
        {
          rating: "3",
          message: "Neutral",
        },
        {
          rating: "2",
          message: "Poor",
        },
        {
          rating: "1",
          message: "Very poor",
        },
        ]
      },
    ]
  }

  const selectPolicies = {
    sections: [
      {
        type: 'title-with-details-cross',
        data: {
          title: 'Select policies'
        },
      },
      {
        type: 'policies-card',
        data: [
         { name: 'Purchase-view', description: 'Source raw materials' },
         { name: 'Purchase-edit', description: 'Source raw materials' },
         { name: 'Production', description: 'Convert materials into frozen goods' },
         { name: 'Package', description: 'Pack and label products for delivery' },
         { name: 'Sales-view', description: 'View sales' },
         { name: 'Sales-edit', description: 'Edit sales' },
         { name: 'Trucks', description: 'Manage trucks' },
         { name: 'Labours', description: 'Manage labours' },
        ]
      },
    ],
    buttons: [
      { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false, actionKey: 'cancel-policies' },
      { text: 'Select', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: 'select-policies' },
    ],
  }

    const selectPackageType = {
    sections: [
      {
        type: 'optionList',
        data: {
          isCheckEnable: false,
          options: [
            "pouch",
            "bag",
            "box",
          ],
          key: "select-package-type"
        }
      },
    ],
  };

  const exportDataOptions = {
    sections: [
      {
        type: "header",
        data: {
          label: "Export options",
          title: "",
          value: "",
          icon: "calendar",
          description: "",
          color: "red",
        },
      },
      {
        type: "data",
        data: [
          {
            title: "Export Details",
            details: [
              {
                row_1: [
                  {
                    label: "Rows exported",
                    value: "",
                    icon: "database",
                  },
                  {
                    label: "File size",
                    value: "",
                    icon: "file",
                  },
                ],
              },
              {
                row_2: [
                  {
                    label: "Report type",
                    value: "",
                    icon: "truck-number",
                  },
                  {
                    label: "Time range",
                    value: "",
                    icon: "clock",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    buttons: [
      {
        text: "open",
        variant: "fill",
        color: "green",
        alignment: "half",
        disabled: false,
        actionKey: "export-open",
      },
      {
        text: "share",
        variant: "outline",
        color: "green",
        alignment: "half",
        disabled: false,
        actionKey: "export-share",
      },
    ],
  };

  const validateAndSetData = async (id: string, type: BottomSheetSchemaKey, overrideConfig?: any) => {
    if (!type || !(type in bottomSheetSchemas)) {
      console.log(`[validateAndSetData] No bottom sheet configured for type: ${type}`);
      return;
    }

    const schema = bottomSheetSchemas[type];
    if (!schema) {
      console.error(`No schema found for type: ${type}`);
      return;
    }

    let data: any = undefined;
    if (overrideConfig) {
      data = overrideConfig;
    } else {
      switch (type) {
        case "edit-order":
          data = editOrder;
          break;
        case "cancel-order":
          data = cancelOrder;
          break;
        case "package-comes-to-end":
          data = packageComesToEnd;
          break;
        // case "verify-material":
        //   data = verifyMaterial;
        case "filter":
          data = filter;
          break;
        case "supervisor-production":
          data = supervisorProduction;
          break;
        case "fill-package":
          data = fillPackage;
          break;
        case "add-package":
          data = addPackage;
          break;
        case "add-product-package":
          data = addProductPackage;
          break;
        case "package-weight":
          data = packageWeight;
          break;
        case "image-preview":
          data = ImagePreview;
          break;
        case "country":
          data = countries;
          break;
        case "choose-package":
          data = choosePackaging;
          break;
        case "vehicle-type":
          data = vehicleType;
          break;
        case "rating":
          data = rating;
          break;
        case "select-role":
          data = role;
          break;
        case "user-action":
          data = UserAction;
          break;
        case "storage-rm-rating":
          data = storageRmRating;
          break;
        case "select-policies":
          data = selectPolicies;
          break;
        case "select-package-type":
          data = selectPackageType;
          break;
        case "choose-export-type":
          data = chooseExportType;
          break;
        case "choose-export-format":
          data = chooseExportFormat;
          break;
        case "export-data-options":
          data = exportDataOptions;
          break;
      }
    }

    if (!data) {
      const queryOptions = getBottomSheetQueryOptions(id, type);
      const queryKey = queryOptions.queryKey;
      data = queryClient.getQueryData(queryKey);

      if (!data) {
        try {
          data = await queryClient.fetchQuery(queryOptions);
        } catch (error) {
          console.error('Failed to fetch bottom sheet data:', error);
          return;
        }
      }
    }

    const validationResult = schema.safeParse(data);

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return;
    }

    const currentActionsType = getBottomSheetActions(type);

    const parsedData = validationResult.data as UpcomingOrderBottomSheetConfig;

    const enhancedButtons = (parsedData?.buttons as ButtonConfig[] || []).map((btn, idx: number) => ({
      ...btn,
      actionKey: currentActionsType[idx] || undefined,
    })) as ButtonConfig[];

    dispatch(
      // @ts-ignore
      openBottomSheet({
        ...validationResult.data,
        buttons: enhancedButtons,
        meta: {
          id,
          type,
          mode: overrideConfig?.mode,
          mainSelection: overrideConfig?.mainSelection,
          subSelection: overrideConfig?.subSelection,
          data: overrideConfig?.metaData,
        },
      }),
    );
  };

  return { validateAndSetData };
};

export default useValidateAndOpenBottomSheet;