import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import useStep from "@/hooks/useStep";
import useInventoryValidator from "@/hooks/useInventoryValidator.jsx";
import ModalAccordion from "@/components/modals/ModalAccordion.jsx";
import ImageUploader from "../../Shared/oldInventory/ImageUploader";
import ExcelUploader from "../../Shared/oldInventory/ExcelUploader";
import { bulkIngest } from "../../../services/oldInventory.service";

const STEPS_CONFIG = [
  { key: 1, title: "Raw Material entry", acceptsImage: true, buttonLabel: "Add Raw Material" },
  { key: 2, title: "Vendor entry", acceptsImage: false, buttonLabel: "Add Vendor" },
  // { key: 2, title: "Production entry", acceptsImage: false, buttonLabel: "Add Production" },
  { key: 3, title: "Chamber Stock entry", acceptsImage: false, buttonLabel: "Add ChamberStock" },
  { key: 4, title: "Dispatch Order entry", acceptsImage: true, buttonLabel: "Add Dispatch Order" },
];

export default function OldInventory() {
  const { step, next, prev } = useStep(1, STEPS_CONFIG.length);
  const { validateExcel } = useInventoryValidator();

  const [excelRows, setExcelRows] = useState([]);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [challan, setChallan] = useState({
    rawMaterial: { in: [], out: [] },
    dispatch: [],
  });
  const [fullData, setFullData] = useState({
    rawMaterial: null,
    production: null,
    chamberStock: null,
    dispatchOrder: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalErrors, setModalErrors] = useState([]);
  const [nextStepTitle, setNextStepTitle] = useState("");

  const [skipStep2, setSkipStep2] = useState(true);

  const handleExcelChange = (event) => {
    const excelFile = event.target.files && event.target.files[0];
    if (!excelFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      setExcelRows(rows || []);
      setParsedPreview((rows || []).slice(0, 21));
    };
    reader.readAsArrayBuffer(excelFile);
  };

  function normalizeTruckFields(row = {}, type = "raw") {
    const out = { ...row };
    const td = { ...(out.truck_details || {}) };

    if (out.truck_weight != null) td.truck_weight = String(out.truck_weight);
    if (out.tare_weight != null) td.tare_weight = String(out.tare_weight);
    if (out.truck_loaded_weight != null)
      td.truck_loaded_weight = String(out.truck_loaded_weight);

    if (out.truck_number != null && !td.truck_number) td.truck_number = String(out.truck_number);
    if (out.driver_name != null && !td.driver_name) td.driver_name = String(out.driver_name);

    if (out.truck_driver != null && !td.driver_name) td.driver_name = String(out.truck_driver);
    if (out.truck_agency != null && !td.agency_name) td.agency_name = String(out.truck_agency);
    if (out.truck_phone != null && !td.phone) td.phone = String(out.truck_phone);

    if (out.truck_number != null && !td.number) td.number = String(out.truck_number);
    if (out.number != null && !td.number) td.number = String(out.number);

    if (out.type != null && !td.type) td.type = String(out.type);
    if (out.truck_type != null && !td.type) td.type = String(out.truck_type);
    if (!td.type) td.type = "Eicher";

    if (!td.challan) {
      if (out.challan && typeof out.challan === "string") {
        td.challan = { url: out.challan, key: null };
      } else if (out.challan && typeof out.challan === "object" && (out.challan.url || out.challan.preview || out.challan.key)) {
        td.challan = { url: out.challan.url || out.challan.preview || null, key: out.challan.key || null };
      } else if (out.challan_in && Array.isArray(out.challan_in) && out.challan_in[0]) {
        td.challan = { url: out.challan_in[0].preview || out.challan_in[0].url || null, key: out.challan_in[0].key || null };
      } else if (out.truck_details && out.truck_details.challan) {
        td.challan = out.truck_details.challan;
      }
    }

    out.truck_details = td;

    const removeKeys = [
      "truck_weight",
      "tare_weight",
      "truck_loaded_weight",
      "truck_number",
      "truck_driver",
      "truck_agency",
      "truck_phone",
      "truck_type",
      "driver_name",
      "number",
    ];
    for (const k of removeKeys) delete out[k];

    return out;
  }

  function normalizeRowsForStep(mappedRows = [], stepKey = 1) {
    if (!Array.isArray(mappedRows)) return mappedRows;
    if (stepKey === 1) {
      return mappedRows.map((r) => normalizeTruckFields(r, "raw"));
    } else if (stepKey === 4) {
      return mappedRows.map((r) => normalizeTruckFields(r, "dispatch"));
    }
    return mappedRows;
  }

  const onClickNext = async () => {
    const currentCfg = STEPS_CONFIG.find((s) => s.key === step);
    if (!excelRows || excelRows.length <= 1) {
      toast.error("Please upload a valid file with data before proceeding.");
      return;
    }

    if (currentCfg.acceptsImage) {
      if (step === 1) {
        const cmIn = challan.rawMaterial?.in ?? [];
        const cmOut = challan.rawMaterial?.out ?? [];
      } else if (step === 4) {
      }
    }

    const { errors, mappedRows } = validateExcel(excelRows, step);
    if (errors && errors.length) {
      setModalErrors(errors);
      setShowModal(true);
      return;
    }

    const normalizedRows = normalizeRowsForStep(mappedRows, step);

    function cellToString(val) {
      if (val == null) return "";
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean")
        return String(val);
      if (Array.isArray(val)) {
        try {
          if (val.length && val.every((i) => typeof i !== "object")) return val.join(", ");
          return JSON.stringify(val);
        } catch {
          return String(val);
        }
      }
      if (typeof val === "object") {
        const td = val.truck_details ? val.truck_details : val;
        if (td && typeof td === "object") {
          const parts = [];
          if (td.truck_number) parts.push(td.truck_number);
          if (td.number) parts.push(td.number);
          if (td.agency_name) parts.push(td.agency_name);
          if (td.driver_name) parts.push(td.driver_name);
          if (parts.length) return parts.join(" | ");
        }
        if (val.name && (val.quantity != null)) return `${val.name} (${val.quantity})`;
        if (Array.isArray(val.products) || Array.isArray(val.packages)) {
          try { return JSON.stringify(val); } catch {}
        }
        try { return JSON.stringify(val); } catch { return String(val); }
      }
      return String(val);
    }
    
    const headers = Object.keys(normalizedRows[0] || {});
    const previewRows = normalizedRows.slice(0, 20).map((r) =>
      Object.values(r).map((v) => cellToString(v))
    );
    
    setParsedPreview([headers, ...previewRows]);

    let stepPayload = null;
    if (step === 1) {
      stepPayload = { rows: normalizedRows };
      // stepPayload = { rows: normalizedRows, challan: challan.rawMaterial };
    } else if (step === 2) {
      stepPayload = { rows: normalizedRows };
    } else if (step === 3) {
      stepPayload = { rows: normalizedRows };
    } else if (step === 4) {
      stepPayload = { rows: normalizedRows };
      // stepPayload = { rows: normalizedRows, challan: challan.dispatch };
    }

    const keyMap = { 1: "rawMaterial", 2: "vendor", 3: "chamberStock", 4: "dispatchOrder" };
    // const keyMap = { 1: "rawMaterial", 2: "production", 3: "chamberStock", 4: "dispatchOrder" };
    const currentKey = keyMap[step];

    const finalMerged = { ...fullData, [currentKey]: stepPayload };

    setFullData(finalMerged);

    if (step === STEPS_CONFIG.length) {
      // console.log("FINAL MERGED INVENTORY JSON:", JSON.stringify(finalMerged, null, 2));
      toast.success("All steps completed!");

      const defensivelyNormalized = { ...finalMerged };
      if (defensivelyNormalized.rawMaterial?.rows) {
        defensivelyNormalized.rawMaterial.rows = defensivelyNormalized.rawMaterial.rows.map((r) => normalizeTruckFields(r, "raw"));
      }
      if (defensivelyNormalized.dispatchOrder?.rows) {
        defensivelyNormalized.dispatchOrder.rows = defensivelyNormalized.dispatchOrder.rows.map((r) => normalizeTruckFields(r, "dispatch"));
      }

      console.log("defensivelyNormalized", JSON.stringify(defensivelyNormalized, null, 2));

      try {
        const response = await bulkIngest(defensivelyNormalized);
      } catch (err) {
        console.error("bulkIngest failed:", err);
        toast.error("Upload failed. See console for details.");
      }
      return;
    }

    if (step === 1 && skipStep2) {
      const nextCfg = STEPS_CONFIG.find((s) => s.key === 3);
      setNextStepTitle(nextCfg ? nextCfg.title : "");
      toast.success(`${currentCfg.title} completed! Skipping ${STEPS_CONFIG.find(s => s.key === 2).title} and proceeding to ${nextCfg.title}.`);
      next();
      setTimeout(() => {
        next();
      }, 0);

      setExcelRows([]);
      return;
    }
    const nextCfg = STEPS_CONFIG.find((s) => s.key === step + 1);
    setNextStepTitle(nextCfg ? nextCfg.title : "");
    toast.success(`${currentCfg.title} completed! Proceed to ${nextCfg.title}.`);
    next();
    setExcelRows([]);
  };

  return (
    <div className="container d-flex flex-column gap-3" style={{ height: "89vh" }}>
      <div className="flex-grow-1" style={{ minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
        <div className="row">
          {/* Left column: steps 1 & 2 */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              {STEPS_CONFIG.slice(0, 2).map((cfg) => (
                <div key={cfg.key} className="card">
                  <div className="d-flex justify-content-between align-items-center card-header">
                    <h6>{cfg.title}</h6>
                  </div>
                  <div className="card-body">
                    <ExcelUploader disabled={cfg.key !== step} onFileChange={handleExcelChange} />

                    {/* Raw Material: two challans side-by-side */}
                    {cfg.acceptsImage && cfg.key === 1 && (
                      <div className="d-flex gap-3 mt-3">
                        <div className="flex-fill">
                          <ImageUploader
                            name="Challan In"
                            multiple={false}
                            value={challan.rawMaterial.in}
                            onChange={(arr) =>
                              setChallan((prev) => ({ ...prev, rawMaterial: { ...prev.rawMaterial, in: arr } }))
                            }
                            disabled={cfg.key !== step}
                          />
                        </div>

                        <div className="flex-fill">
                          <ImageUploader
                            name="Challan Out"
                            multiple={false}
                            value={challan.rawMaterial.out}
                            onChange={(arr) =>
                              setChallan((prev) => ({ ...prev, rawMaterial: { ...prev.rawMaterial, out: arr } }))
                            }
                            disabled={cfg.key !== step}
                          />
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-success" onClick={onClickNext} disabled={cfg.key !== step}>
                        {cfg.buttonLabel}
                      </button>

                      {step > 1 && cfg.key === step && (
                        <button type="button" className="btn btn-secondary" onClick={() => prev()}>
                          Back
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: steps 3 & 4 */}
          <div className="col-md-6">
            <div className="d-flex flex-column gap-3">
              {STEPS_CONFIG.slice(2).map((cfg) => (
                <div key={cfg.key} className="card">
                  <div className="d-flex justify-content-between align-items-center card-header">
                    <h6>{cfg.title}</h6>
                  </div>

                  <div className="card-body">
                    <ExcelUploader disabled={cfg.key !== step} onFileChange={handleExcelChange} />

                    {/* Dispatch: upload dispatch challan here */}
                    {cfg.acceptsImage && cfg.key === 4 && (
                      <div className="mt-3">
                        <ImageUploader
                          name="Dispatch Challan"
                          multiple={false}
                          value={challan.dispatch}
                          onChange={(arr) => setChallan((prev) => ({ ...prev, dispatch: arr }))}
                          disabled={cfg.key !== step}
                        />
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <button type="button" className="btn btn-success" onClick={onClickNext} disabled={cfg.key !== step}>
                        {cfg.buttonLabel}
                      </button>

                      {step > 1 && cfg.key === step && (
                        <button type="button" className="btn btn-secondary" onClick={() => prev()}>
                          Back
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="row">
          <div className="col-md-12">
            {parsedPreview && parsedPreview.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h6>List New Added Inventory (Preview)</h6>
                </div>
                <div className="card-body" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                  <div className="table-responsive">
                    <table className="table align-items-center mb-0">
                      <thead>
                        <tr>{parsedPreview[0].map((headerCell, idx) => <th key={idx}>{headerCell}</th>)}</tr>
                      </thead>
                      <tbody>
                        {parsedPreview.slice(1).map((row, ridx) => (
                          <tr key={ridx}>{row.map((cell, cidx) => <td key={cidx}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalAccordion
        isOpen={showModal}
        title={`Validation errors - ${STEPS_CONFIG.find((s) => s.key === step)?.title || ""}`}
        errors={modalErrors}
        onClose={() => {
          setShowModal(false);
          setModalErrors([]);
        }}
      />
    </div>
  );
}