export const routeLabels = [
  // HOME
  { match: /^\/$/, crumbs: ["Home"] },

  // MASTERS
  { match: /^\/items-list/, crumbs: ["Masters", "Items"] },
  { match: /^\/add-items/, crumbs: ["Masters", "Items", "Add Item"] },
  { match: /^\/update-item\/[^/]+$/, crumbs: ["Masters", "Items", "Edit Item"] },

  { match: /^\/raw-material$/, crumbs: ["Masters", "Raw Materials"] },
  { match: /^\/add-raw-material$/, crumbs: ["Masters", "Raw Materials", "Add"] },
  { match: /^\/add-raw-material\/[^/]+$/, crumbs: ["Masters", "Raw Materials", "Edit"] },

  { match: /^\/work-location$/, crumbs: ["Masters", "Locations"] },
  { match: /^\/add-location$/, crumbs: ["Masters", "Locations", "Add"] },
  { match: /^\/edit-location\/[^/]+$/, crumbs: ["Masters", "Locations", "Edit"] },

  { match: /^\/lane$/, crumbs: ["Masters", "Production Lines"] },
  { match: /^\/add-lane$/, crumbs: ["Masters", "Production Lines", "Add"] },
  { match: /^\/edit-lane\/[^/]+$/, crumbs: ["Masters", "Production Lines", "Edit"] },

  { match: /^\/frozen-warehouse\/chamber-list$/, crumbs: ["Masters", "Chambers"] },
  { match: /^\/frozen-warehouse\/create-chamber$/, crumbs: ["Masters", "Chambers", "Add"] },

  // TRANSACTION (THE IMPORTANT ONE)
  { match: /^\/raw-material-other$/, crumbs: ["Transactions", "Third-Party Storage"] },
  { match: /^\/raw-material-other\/add$/, crumbs: ["Transactions", "Third-Party Storage", "Add Entry"] },
  { match: /^\/raw-material-other\/update\/[^/]+$/, crumbs: ["Transactions", "Third-Party Storage", "Edit Entry"] },

  // UTILITIES
  { match: /^\/chamberstock\/edit$/, crumbs: ["Utilities", "Chamber Stock"] },
  { match: /^\/old-inventory$/, crumbs: ["Utilities", "Old Inventory Import"] },
];