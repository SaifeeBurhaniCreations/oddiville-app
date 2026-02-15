import { useState } from "react";
  import * as XLSX from "xlsx";
  import { toast } from "react-toastify";
  import useInventoryValidator from "@/hooks/useInventoryValidator.jsx";
  import ModalAccordion from "@/components/modals/ModalAccordion.jsx";
  // import ImageUploader from "../../Shared/oldInventory/ImageUploader";
  import ExcelUploader from "../../Shared/oldInventory/ExcelUploader";
  import { bulkIngest } from "../../../services/oldInventory.service";

  export default function OldInventory() {
    const { validateExcel } = useInventoryValidator();

    const [parsedPreview, setParsedPreview] = useState([]);
    const [challan, setChallan] = useState({
      rawMaterial: { in: [], out: [] },
      dispatch: { in: [], out: [] },
    });

    const [fullData, setFullData] = useState({
      rawMaterial: null,
      vendor: null,
      chamberStock: null,
      dispatchOrder: null,
    });
    const [showModal, setShowModal] = useState(false);
    const [modalErrors, setModalErrors] = useState([]);

    const handleExcelChange = (event) => {
      const excelFile = event.target.files && event.target.files[0];
      if (!excelFile) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const SHEET_MAP = {
          vendors: 1,
          raw_material_orders: 2,
          chamber_stock: 3,
          dispatch_orders: 4,
        };

        const mergedPayload = {};
        let previewSet = false;

        workbook.SheetNames.forEach((sheetName) => {
          const normalizedSheet = sheetName.trim().toLowerCase();
          const stepKey = SHEET_MAP[normalizedSheet];

          if (!stepKey) return; 
          
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
          });
          const cleanedRows = rows.filter((row, index) => {
            if (index === 0) return true;
            return row.some(cell => cell !== null && cell !== "");
          });

          if (!rows || rows.length <= 1) return;
        
          const { errors, mappedRows } = validateExcel(cleanedRows, stepKey);

          if (errors && errors.length) {
            setModalErrors(errors);
            setShowModal(true);
            return;
          }

          const normalizedRows = normalizeRowsForStep(mappedRows, stepKey);

          if (!previewSet) {
            const headers = Object.keys(normalizedRows[0] || {});
            const previewRows = normalizedRows
              .slice(0, 20)
              .map((r) => Object.values(r).map((v) => String(v ?? "")));

            setParsedPreview([headers, ...previewRows]);
            previewSet = true;
          }

          if (stepKey === 1) mergedPayload.vendors = normalizedRows;
          if (stepKey === 2) mergedPayload.rawMaterial = { rows: normalizedRows };
          if (stepKey === 3) mergedPayload.chamberStock = { rows: normalizedRows };
          if (stepKey === 4) mergedPayload.dispatchOrder = { rows: normalizedRows };
        });

        setFullData(mergedPayload);
      };

      reader.readAsArrayBuffer(excelFile);
    };

function normalizeTruckFields(row = {}, type = "raw") {
const out = { ...row };
const td = { ...(out.truck_details || {}) };

const vehicleNumber =
out.number ??
out.truck_number ??
out.vehicle_no ??
td.number ??
td.truck_number ??
null;

if (vehicleNumber != null) {
td.number = String(vehicleNumber).trim();
}

delete td.truck_number;

if (out.gross_weight != null) td.truck_weight = String(out.gross_weight);
if (out.tare_weight != null) td.tare_weight = String(out.tare_weight);
if (out.driver_name != null || out.truck_driver != null)
td.driver_name = String(out.driver_name ?? out.truck_driver);

if (out.truck_agency != null) td.agency_name = String(out.truck_agency);
if (out.truck_phone != null) td.phone = String(out.truck_phone);

td.type = String(out.type ?? out.truck_type ?? td.type ?? "Eicher");

if (!td.challan) {
if (typeof out.challan === "string") {
td.challan = { url: out.challan, key: null };
} else if (out.challan?.url || out.challan?.preview || out.challan?.key) {
td.challan = {
url: out.challan.url || out.challan.preview || null,
key: out.challan.key || null,
};
} else if (Array.isArray(out.challan_in) && out.challan_in[0]) {
td.challan = {
url: out.challan_in[0].preview || out.challan_in[0].url || null,
key: out.challan_in[0].key || null,
};
}
}

out.truck_details = td;

// -------------------------
// remove ALL raw fields
// -------------------------
delete out.number;
delete out.truck_number;
delete out.vehicle_no;
delete out.gross_weight;
delete out.tare_weight;
delete out.truck_driver;
delete out.truck_agency;
delete out.truck_phone;
delete out.truck_type;
delete out.driver_name;

return out;
}

    function normalizeVendorMaterialsFields(row = {}) {
      const out = { ...row };

      if (typeof out.materials === "string") {
        out.materials = out.materials
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      }

      if (!Array.isArray(out.materials)) {
        out.materials = [];
      }

      return out;
    }

    function normalizeChamberStockFields(row = {}) {
      const out = { ...row };

      const {
        product_name,
        category,
        unit,
        chamber_name,
        bags,
        size_value,
        size_unit,
        packets_per_bag,
        rating,
      } = out;

      if (bags === "" || bags == null) return null;

      const bagCount = Number(bags);
      const sizeVal = Number(size_value || 0);
      const packetsPerBag = Number(packets_per_bag || 1);

      let packaging = null;
      let packages = null;
      let chamberQuantity = "0";

      if (category === "material") {
        // MATERIAL → packaging
        packaging = {
          size: {
            value: sizeVal,
            unit: size_unit,
          },
          type: "bag",
          count: bagCount,
        };

        chamberQuantity = String(bagCount);
      }

      if (category === "packed") {
        packages = [
          {
            size: sizeVal,
            unit: size_unit,
            packets_per_bag: packetsPerBag, 
          },
        ];

        chamberQuantity = String(bagCount); 
      }

      const normalized = {
        _id: out._id,
        product_name,
        category,
        unit,
        packaging,
        packages,
       chamber: [
            {
              id: String(chamber_name).trim(),
              quantity: chamberQuantity,
              packets_per_bag: packetsPerBag,
              rating: rating != null ? String(rating) : "",
            },
          ],

      };

      return normalized;
    }

function normalizeDispatchFields(rows = []) {
  const ordersMap = {};

  rows.forEach((row) => {
    const {
      customer_name,
      address,
      state,
      country,
      city,
      status,
      est_delivered_date,
      amount,
      product_name,
      chamber_id,
      dispatch_quantity,
      package_size,
      package_unit,
    } = row;

    const orderKey = `${customer_name}-${est_delivered_date}`;

    if (!ordersMap[orderKey]) {
      ordersMap[orderKey] = {
        customer_name,
        address,
        state,
        country,
        city,
        status: status || "pending",
        est_delivered_date,
        amount: Number(amount || 0),
        products: [],
        usedBagsByProduct: {},
        truck_details: normalizeTruckFields(row, "dispatch").truck_details,
      };
    }

    const order = ordersMap[orderKey];

    // products
    let existingProduct = order.products.find((p) => p.name === product_name);
    if (!existingProduct) {
      existingProduct = { name: product_name, chambers: [] };
      order.products.push(existingProduct);
    }

    existingProduct.chambers.push({
      id: String(chamber_id).trim(),
      quantity: Number(dispatch_quantity),
    });

    // packets tracking
    const pkgKey = `${package_size}-${package_unit}`;
    if (!order.usedBagsByProduct[product_name])
      order.usedBagsByProduct[product_name] = {};

    if (!order.usedBagsByProduct[product_name][pkgKey]) {
      order.usedBagsByProduct[product_name][pkgKey] = {
        totalPackets: 0,
        byChamber: {},
      };
    }

    const qty = Number(dispatch_quantity || 0);
    order.usedBagsByProduct[product_name][pkgKey].totalPackets += qty;
    order.usedBagsByProduct[product_name][pkgKey].byChamber[chamber_id] =
      (order.usedBagsByProduct[product_name][pkgKey].byChamber[chamber_id] || 0) + qty;
  });

  // NOW build packages (after aggregation)
  Object.values(ordersMap).forEach(order => {
    order.packages = [];

    Object.entries(order.usedBagsByProduct).forEach(([product, sizes]) => {
      Object.entries(sizes).forEach(([key, data]) => {
        const [size, unit] = key.split("-");
        order.packages.push({
          id: product,
          size,
          unit,
          quantity: Number(data.totalPackets || 0)
        });
      });
    });

    order.product_name = order.products[0]?.name || "";
  });

  return Object.values(ordersMap);
}

    function normalizeRowsForStep(mappedRows = [], stepKey = 1) {
      if (!Array.isArray(mappedRows)) return mappedRows;

      if (stepKey === 1) {
        return mappedRows.map((r) => normalizeVendorMaterialsFields(r));
      }

      if (stepKey === 2) {
        return mappedRows.map((r) => normalizeTruckFields(r, "raw"));
      }

      if (stepKey === 3) {
        return mappedRows.map((r) => normalizeChamberStockFields(r)).filter(Boolean);
      }

      if (stepKey === 4) {
        return normalizeDispatchFields(mappedRows);
      }

      return mappedRows;
    }

    const onClickNext = async () => {
      if (!fullData || Object.keys(fullData).length === 0) {
        toast.error("No valid sheets found in file.");
        return;
      }

      try {
        // console.log("FINAL BULK PAYLOAD:", JSON.stringify(fullData, null, 2));
        await bulkIngest(fullData);
        toast.success("Bulk upload successful!");
      } catch (err) {
        console.error("bulkIngest failed:", err);
        toast.error("Upload failed.");
      }
    };

    return (
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h6>Bulk Inventory Upload (4 Sheet Excel)</h6>
          </div>
          <div className="card-body">
            <ExcelUploader onFileChange={handleExcelChange} />

            <button
              className="btn btn-success mt-3"
              onClick={onClickNext}
            >
              Submit
            </button>
          </div>
        </div>

        {parsedPreview.length > 0 && (
          <div className="card mt-3">
            <div className="card-header">
              <h6>Preview</h6>
            </div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    {parsedPreview[0].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedPreview.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ModalAccordion
          isOpen={showModal}
          title="Validation Errors"
          errors={modalErrors}
          onClose={() => {
            setShowModal(false);
            setModalErrors([]);
          }}
        />
      </div>

    );
  }