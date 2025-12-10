import ChamberStockTable from "@/components/tables/ChamberStockTable"; 
import { useChambers, useChamberstock } from "../../hooks/chamberStock";
import { useArrayTransformer } from "../../sbc/utils/arrayTransformer/useArrayTransformer";
import { useMemo } from "react";

const ChamberStockForm = ({ id, form, isLoading, handleSubmit, handleExit }) => {
  const { values, errors, setField, isValid } = form;
  const { isLoading: isChamberStockLoading, data: chamberStock } =
    useChamberstock();

  const { data: chambers, isLoading: isChamberLoading, error } = useChambers();

const chamberStockSafe = Array.isArray(chamberStock) ? chamberStock : [];

  const chamberLookup = useMemo(() => {
    const m = new Map();
    (Array.isArray(chambers) ? chambers : []).forEach((c) => {
      const key = c.id ?? c.chamberId ?? c._id;
      if (key !== undefined) m.set(String(key), c);
    });
    return m;
  }, [chambers]);

  const { data: transformed = [] } = useArrayTransformer(
    chamberStockSafe,
    {
      deepClone: true,
      map: (service) => {
        if (!Array.isArray(service.chamber)) return service;
        const s = { ...service };
        s.chamber = s.chamber.map((c) => {
          const cid = c.id ?? c.chamberId ?? c._id;
          const found =
            cid !== undefined ? chamberLookup.get(String(cid)) : undefined;
          const newName =
            (found &&
              (found.name ?? found.chamber_name ?? found.displayName)) ??
            c.chamber_name ??
            c.name ??
            String(cid ?? "");
          return { ...c, chamber_name: newName };
        });
        return s;
      },
    },
    [chambers]
  );

  if (isChamberStockLoading || isChamberLoading) return <div>Loading…</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="card shadow-sm rounded-3">
        <div className="card-header flex-cs gap-2 justify-content-between pt-4 pb-2 bg-light">
          <h5 className="m-0">Manage ChamberStock</h5>
          {id && (
            <button
              type="button"
              onClick={handleExit}
              className="btn btn-secondary btn-md m-0"
            >
              Clear
            </button>
          )}
        </div>

        <div className="card-body pb-4">
          <div className="table-responsive p-0">
            <ChamberStockTable
              chamberStock={transformed}
              isLoading={isChamberStockLoading}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChamberStockForm;
