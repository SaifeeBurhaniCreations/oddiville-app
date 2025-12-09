    export const filterHandlers: Record<string, (item: any, subKey: string, selected: string[]) => boolean> = {
        "raw-material:overview": (item, subKey, selected) => {
            if (subKey === "Name") {
                if (selected.includes("All")) return true;
                return selected.length === 0 || selected.some(sel => item.name?.toLowerCase() === sel.toLowerCase());
            }
            return true;
        },
        "raw-material:detailed": (item, subKey, selected) => {
            if (subKey === "Name") {
                return selected.length === 0 || selected.some(sel => item.name?.toLowerCase() === sel.toLowerCase());
            }
            if (subKey === "Category") {
                return selected.length === 0 || selected.some(sel => item.category?.toLowerCase() === sel.toLowerCase());
            }
            return true;
        },
      "chamber:detailed": (item, subKey, selected) => {
    if (!selected || selected.length === 0) return true;
console.log("item.category", item.category);

    const cat = (item.category ?? "").toLowerCase();
console.log("cat", cat);
 
    if (subKey === "Material") {
      return cat === "material";
    }

    if (subKey === "Others") {
      return cat === "other";
    }

    if (subKey === "Packed") {
      return cat === "packed";
    }

    return true;
  },
    };