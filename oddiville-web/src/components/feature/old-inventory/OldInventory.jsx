  import React, { useEffect, useState } from "react";
  import * as XLSX from "xlsx";
  import { toast } from "react-toastify";
  import useStep from "@/hooks/useStep";
  import useInventoryValidator from "@/hooks/useInventoryValidator.jsx";
  import ModalAccordion from "@/components/modals/ModalAccordion.jsx";
  import ImageUploader from "../../Shared/oldInventory/ImageUploader";
  import ExcelUploader from "../../Shared/oldInventory/ExcelUploader";
  import { bulkIngest } from "../../../services/oldInventory.service";

  const STEPS_CONFIG = [
    {
      key: 1,
      title: "Raw Material entry",
      acceptsImage: true,
      buttonLabel: "Add Raw Material",
      optional: true,
    },
    {
      key: 2,
      title: "Vendor entry",
      acceptsImage: false,
      buttonLabel: "Add Vendor",
      optional: true,
    },
    {
      key: 3,
      title: "Chamber Stock entry",
      acceptsImage: false,
      buttonLabel: "Add ChamberStock",
    },
    {
      key: 4,
      title: "Dispatch Order entry",
      acceptsImage: true,
      buttonLabel: "Add Dispatch Order",
      optional: true 
    },
  ];

  export default function OldInventory() {
    const [enableRawMaterial, setEnableRawMaterial] = useState(false);
  const [enableDispatchOrder, setEnableDispatchOrder] = useState(false);
  const enabledSteps = STEPS_CONFIG.filter(cfg => {
    if (cfg.key === 1 && !enableRawMaterial) return false;
    if (cfg.key === 4 && !enableDispatchOrder) return false;
    return true;
  });

  const { step, next, prev } = useStep(
    enabledSteps[0].key,
    enabledSteps[enabledSteps.length - 1].key
  );

    const { validateExcel } = useInventoryValidator();

    const [excelRows, setExcelRows] = useState([]);
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
    const [nextStepTitle, setNextStepTitle] = useState("");
    const [currentStepData, setCurrentStepData] = useState({
      step: null,
      rows: [],
    });

    // const [skipStep2, setSkipStep2] = useState(true);
    // const [skipStep1, setSkipStep1] = useState(true);

    const handleExcelChange = (event) => {
      const excelFile = event.target.files && event.target.files[0];
      if (!excelFile) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
        });

        setExcelRows(rows || []);
        setParsedPreview((rows || []).slice(0, 21));

        const { errors, mappedRows } = validateExcel(rows, step);
        if (errors && errors.length) return;

        const normalizedRows = normalizeRowsForStep(mappedRows, step);

        setCurrentStepData({
          step,
          rows: normalizedRows,
        });
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

      if (out.truck_number != null && !td.truck_number)
        td.truck_number = String(out.truck_number);
      if (out.driver_name != null && !td.driver_name)
        td.driver_name = String(out.driver_name);

      if (out.truck_driver != null && !td.driver_name)
        td.driver_name = String(out.truck_driver);
      if (out.truck_agency != null && !td.agency_name)
        td.agency_name = String(out.truck_agency);
      if (out.truck_phone != null && !td.phone)
        td.phone = String(out.truck_phone);

      if (out.truck_number != null && !td.number)
        td.number = String(out.truck_number);
      if (out.number != null && !td.number) td.number = String(out.number);

      if (out.type != null && !td.type) td.type = String(out.type);
      if (out.truck_type != null && !td.type) td.type = String(out.truck_type);
      if (!td.type) td.type = "Eicher";

      if (!td.challan) {
        if (out.challan && typeof out.challan === "string") {
          td.challan = { url: out.challan, key: null };
        } else if (
          out.challan &&
          typeof out.challan === "object" &&
          (out.challan.url || out.challan.preview || out.challan.key)
        ) {
          td.challan = {
            url: out.challan.url || out.challan.preview || null,
            key: out.challan.key || null,
          };
        } else if (
          out.challan_in &&
          Array.isArray(out.challan_in) &&
          out.challan_in[0]
        ) {
          td.challan = {
            url: out.challan_in[0].preview || out.challan_in[0].url || null,
            key: out.challan_in[0].key || null,
          };
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

      const chamberName = out.chamber_name;
      const quantity = out.quantity;
      const rating = out.rating;

      out.chamber = [];

      if (chamberName) {
        out.chamber.push({
          id: String(chamberName).trim(),
          quantity: quantity != null ? String(quantity) : "",
          rating: rating != null ? String(rating) : "",
        });
      }

      delete out.chamber_name;
      delete out.quantity;
      delete out.rating;

      return out;
    }

    function normalizeRowsForStep(mappedRows = [], stepKey = 1) {
      if (!Array.isArray(mappedRows)) return mappedRows;

      if (stepKey === 1) {
        return mappedRows.map((r) => normalizeTruckFields(r, "raw"));
      }

      if (stepKey === 2) {
        return mappedRows.map((r) => normalizeVendorMaterialsFields(r));
      }

      if (stepKey === 3) {
        return mappedRows.map((r) => normalizeChamberStockFields(r));
      }

      if (stepKey === 4) {
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
        if (
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean"
        )
          return String(val);
        if (Array.isArray(val)) {
          try {
            if (val.length && val.every((i) => typeof i !== "object"))
              return val.join(", ");
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
          if (val.name && val.quantity != null)
            return `${val.name} (${val.quantity})`;
          if (Array.isArray(val.products) || Array.isArray(val.packages)) {
            try {
              return JSON.stringify(val);
            } catch {}
          }
          try {
            return JSON.stringify(val);
          } catch {
            return String(val);
          }
        }
        return String(val);
      }

      const headers = Object.keys(normalizedRows[0] || {});
      const previewRows = normalizedRows
        .slice(0, 20)
        .map((r) => Object.values(r).map((v) => cellToString(v)));

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

      const keyMap = {
        1: "rawMaterial",
        2: "vendor",
        3: "chamberStock",
        4: "dispatchOrder",
      };
      // const keyMap = { 1: "rawMaterial", 2: "production", 3: "chamberStock", 4: "dispatchOrder" };
      const currentKey = keyMap[step];

      const finalMerged = { ...fullData, [currentKey]: stepPayload };

      setFullData(finalMerged);

  const currentStepIndex = enabledSteps.findIndex(s => s.key === step);
  const isFinalStep = currentStepIndex === enabledSteps.length - 1;

  if (isFinalStep) {
        console.log("FINAL MERGED INVENTORY JSON:", JSON.stringify(finalMerged, null, 2));
        toast.success("All steps completed!");

        const defensivelyNormalized = { ...finalMerged };

        if (!enableRawMaterial) {
          delete defensivelyNormalized.rawMaterial;
        }

        if (!enableDispatchOrder) {
          delete defensivelyNormalized.dispatchOrder;
        }

        if (defensivelyNormalized.rawMaterial?.rows) {
          defensivelyNormalized.rawMaterial.rows =
            defensivelyNormalized.rawMaterial.rows.map((r) =>
              normalizeTruckFields(r, "raw")
            );
        }
        if (defensivelyNormalized.dispatchOrder?.rows) {
          defensivelyNormalized.dispatchOrder.rows =
            defensivelyNormalized.dispatchOrder.rows.map((r) =>
              normalizeTruckFields(r, "dispatch")
            );
        }

        // console.log("defensivelyNormalized", JSON.stringify(defensivelyNormalized, null, 2));

        try {
          const response = await bulkIngest(defensivelyNormalized);
        } catch (err) {
          console.error("bulkIngest failed:", err);
          toast.error("Upload failed. See console for details.");
        }
        return;
      }

      // if (step === 1) {
      //   const nextCfg = STEPS_CONFIG.find((s) => s.key === 2);
      //   toast.success(`Skipping Step 1. Proceeding to ${nextCfg?.title}.`);

      //   next();

      //   setExcelRows([]);
      //   return;
      // }

      // if (step === 1 && skipStep2) {
      //   const nextCfg = STEPS_CONFIG.find((s) => s.key === 3);
      //   setNextStepTitle(nextCfg ? nextCfg.title : "");
      //   toast.success(`${currentCfg.title} completed! Skipping ${STEPS_CONFIG.find(s => s.key === 2).title} and proceeding to ${nextCfg.title}.`);
      //   next();
      //   setTimeout(() => {
      //     next();
      //   }, 0);

      //   setExcelRows([]);
      //   return;
      // }

      const nextCfg = STEPS_CONFIG.find((s) => s.key === step + 1);
      setNextStepTitle(nextCfg ? nextCfg.title : "");
      toast.success(
        `${currentCfg.title} completed! Proceed to ${nextCfg.title}.`
      );
      if (step === 3 && !enableDispatchOrder) {
        return; 
      }
      next();
      setExcelRows([]);
    };

    const handleSkipVendor = () => {
      toast.info("Vendor entry skipped");

      setFullData((prev) => ({
        ...prev,
        vendor: { rows: [] },
      }));

      next();
      setExcelRows([]);
      setParsedPreview([]);
    };

    return (
      <div
        className="container d-flex flex-column gap-3"
        style={{ height: "89vh" }}
      >
        <div
          className="flex-grow-1"
          style={{ minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          <div className="d-flex gap-4 mb-3 align-items-center">
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        checked={enableRawMaterial}
        onChange={(e) => setEnableRawMaterial(e.target.checked)}
        id="rawSwitch"
      />
      <label className="form-check-label" htmlFor="rawSwitch">
        Enable Raw Material
      </label>
    </div>

    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        checked={enableDispatchOrder}
        onChange={(e) => setEnableDispatchOrder(e.target.checked)}
        id="dispatchSwitch"
      />
      <label className="form-check-label" htmlFor="dispatchSwitch">
        Enable Dispatch Order
      </label>
    </div>
  </div>

          <div className="row">
            {/* Left column: steps 1 & 2 */}
            <div className="col-md-6">
              <div className="d-flex flex-column gap-3">
                {STEPS_CONFIG.slice(0, 2)
                .filter(cfg => enableRawMaterial || cfg.key !== 1)
                .map((cfg) => (
                  <div key={cfg.key} className="card">
                    <div className="d-flex justify-content-between align-items-center card-header">
                      <h6>{cfg.title}</h6>
                    </div>
                    <div className="card-body">
                      <ExcelUploader
                        disabled={cfg.key !== step}
                        onFileChange={handleExcelChange}
                      />

                      {/* Raw Material: two challans side-by-side */}
                      {cfg.acceptsImage &&
                        cfg.key === 1 &&
                        currentStepData.step === 1 && (
                          <div>
                            {currentStepData.rows.map((row, index) => (
                              <div className="d-flex gap-3 mt-3" key={index}>
                                <div className="flex-fill">
                                  <ImageUploader
                                    name="Challan In"
                                    multiple={false}
                                    value={challan.rawMaterial.in}
                                    onChange={(arr) =>
                                      setChallan((prev) => ({
                                        ...prev,
                                        rawMaterial: {
                                          ...prev.rawMaterial,
                                          in: arr,
                                        },
                                      }))
                                    }
                                    disabled={cfg.key !== step}
                                  >
                                    Challan In {index + 1}
                                  </ImageUploader>
                                </div>

                                <div className="flex-fill">
                                  <ImageUploader
                                    name="Challan Out"
                                    multiple={false}
                                    value={challan.rawMaterial.out}
                                    onChange={(arr) =>
                                      setChallan((prev) => ({
                                        ...prev,
                                        rawMaterial: {
                                          ...prev.rawMaterial,
                                          out: arr,
                                        },
                                      }))
                                    }
                                    disabled={cfg.key !== step}
                                  >
                                    Challan Out {index + 1}
                                  </ImageUploader>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={onClickNext}
                          disabled={cfg.key !== step}
                        >
                          {cfg.buttonLabel}
                        </button>

                        {cfg.key === 2 && step === 2 && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleSkipVendor}
                          >
                            Skip
                          </button>
                        )}

                        {step > 1 && cfg.key === step && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => prev()}
                          >
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

              {STEPS_CONFIG
                .slice(2)
                .filter(cfg => enableDispatchOrder || cfg.key !== 4)
                .map((cfg) => (
                  <div key={cfg.key} className="card">
                    <div className="d-flex justify-content-between align-items-center card-header">
                      <h6>
                        {cfg.title}
                        {cfg.optional && (
                          <span className="text-muted ms-2">(Optional)</span>
                        )}
                      </h6>
                    </div>

                    <div className="card-body">
                      <ExcelUploader
                        disabled={cfg.key !== step}
                        onFileChange={handleExcelChange}
                      />

                      {/* Dispatch: upload dispatch challan here */}
                      {cfg.acceptsImage &&
                        cfg.key === 4 &&
                        currentStepData.step === 4 && (
                          <div>
                            {currentStepData.rows.map((row, index) => (
                              <div className="d-flex gap-3 mt-3" key={index}>
                                <div className="flex-fill">
                                  <ImageUploader
                                    name="Challan In"
                                    multiple={false}
                                    value={challan.dispatch.in}
                                    onChange={(arr) =>
                                      setChallan((prev) => ({
                                        ...prev,
                                        dispatch: { ...prev.dispatch, in: arr },
                                      }))
                                    }
                                    disabled={cfg.key !== step}
                                  >
                                    Challan In {index + 1}
                                  </ImageUploader>
                                </div>

                                <div className="flex-fill">
                                  <ImageUploader
                                    name="Challan Out"
                                    multiple={false}
                                    value={challan.dispatch.out}
                                    onChange={(arr) =>
                                      setChallan((prev) => ({
                                        ...prev,
                                        dispatch: { ...prev.dispatch, out: arr },
                                      }))
                                    }
                                    disabled={cfg.key !== step}
                                  >
                                    Challan Out {index + 1}
                                  </ImageUploader>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* {cfg.acceptsImage && cfg.key === 4 && (
                        <div className="mt-3">
                          <ImageUploader
                            name="Dispatch Challan"
                            multiple={false}
                            value={challan.dispatch}
                            onChange={(arr) => setChallan((prev) => ({ ...prev, dispatch: arr }))}
                            disabled={cfg.key !== step}
                          />
                        </div>
                      )} */}

                      <div className="d-flex gap-2 mt-3">
                      <button
                          type="button"
                          className="btn btn-success"
                          onClick={onClickNext}
                          disabled={cfg.key !== step}
                        >
                          {step === 3 && !enableDispatchOrder
                            ? "Submit Inventory"
                            : cfg.buttonLabel}
                        </button>

                        {cfg.optional && cfg.key === step && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleSkipVendor}
                          >
                            Skip
                          </button>
                        )}

                        {step > 1 && cfg.key === step && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={prev}
                          >
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
          <div className="row mt-3">
            <div className="col-md-12">
              {parsedPreview && parsedPreview.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h6>List New Added Inventory (Preview)</h6>
                  </div>
                  <div
                    className="card-body"
                    style={{ maxHeight: "50vh", overflowY: "auto" }}
                  >
                    <div className="table-responsive">
                      <table className="table align-items-center mb-0">
                        <thead>
                          <tr>
                            {parsedPreview[0].map((headerCell, idx) => (
                              <th key={idx}>{headerCell}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedPreview.slice(1).map((row, ridx) => (
                            <tr key={ridx}>
                              {row.map((cell, cidx) => (
                                <td key={cidx}>{cell}</td>
                              ))}
                            </tr>
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
          title={`Validation errors - ${
            STEPS_CONFIG.find((s) => s.key === step)?.title || ""
          }`}
          errors={modalErrors}
          onClose={() => {
            setShowModal(false);
            setModalErrors([]);
          }}
        />
      </div>
    );
  }
