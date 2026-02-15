import ChamberStockTable from "@/components/tables/ChamberStockTable"; 
import { useChambers, useChamberstock } from "../../hooks/chamberStock";
import { useArrayTransformer } from "../../sbc/utils/arrayTransformer/useArrayTransformer";
import { useMemo } from "react";
import { usePackages } from "../../hooks/Packages";

const normalize = (str) =>
  (str || "").toLowerCase().replace(/\s+/g, " ").trim();

const resolveChamberName = (c, lookup) => {
  const cid = c.id ?? c.chamberId ?? c._id;
  const found = cid ? lookup.get(String(cid)) : undefined;

  return (
    found?.name ??
    found?.chamber_name ??
    found?.displayName ??
    c.chamber_name ??
    c.name ??
    String(cid ?? "")
  );
};

const ChamberStockForm = ({ id, form, isLoading, handleSubmit, handleExit }) => {
  const { isLoading: isChamberStockLoading, data: chamberStock } =
    useChamberstock();

  const { data: chambers, isLoading: isChamberLoading, error } = useChambers();

const chamberStockSafe = Array.isArray(chamberStock) ? chamberStock : [];
const { data: packages = [] } = usePackages("");

  const packageImageMap = useMemo(() => {
    const map = {};

    packages.forEach((pkg) => {
      const key = normalize(pkg.product_name);
      if (!key) return;

      map[key] = pkg?.image?.url || pkg?.package_image?.url || "";
    });

    return map;
  }, [packages]);
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

      const pkgImage = packageImageMap[normalize(service.product_name)] || "";

      if (service.category === "packed" && !service.image) {
        s.image = pkgImage;
      }

      s.chamber = s.chamber.map((c) => ({
        ...c,
        chamber_name:
          c.chamber_name && c.chamber_name.trim() !== ""
            ? c.chamber_name
            : resolveChamberName(c, chamberLookup),
      }));

      return s;
    },
  },
  [chamberLookup, packageImageMap]
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
