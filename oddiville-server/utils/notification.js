const { getIO } = require("../config/socket")


const isoNow = () => new Date().toISOString();

const normalizeProduction = (productionId, productionDetails, type) => ({
  productionId,
  productionDetails,
  timestamp: isoNow(),
  type,
});

const sendRawMaterialStatus = (rawMaterialStatusData) => {
  const io = getIO();
  io.emit("raw-material-order:status-changed", rawMaterialStatusData);
};

const sendRawMaterialCreatedNotification = (rawMaterialCreated) => {
  const io = getIO();
  io.emit("raw-material-order:created", rawMaterialCreated);
};

// user detail notification - create
const sendUserCreatedNotification = (userCreated) => {
    const io = getIO();
    io.emit('user:created', userCreated);
};

// calendar notification - create
const sendCalendarEventCreatedNotification = (calendarEvent) => {
  const io = getIO();
  io.emit("calendar:created", calendarEvent);
};

// // raw material detail notification - update
// const sendRawMaterialUpdatedNotification = (materialId, materialDetails) => {
//     const io = getIO();
//     io.emit('raw-material-order:updated', {
//         materialId,
//         materialDetails,
//         timestamp: new Date(),
//         type: 'RAW_MATERIAL_ORDER_UPDATED'
//     });
// };

// vendor notification - create
const sendVendorCreatedNotification = (vendor) => {
  const io = getIO();
  io.emit("vendor:created", vendor);
};

// vendor notification - update
const sendVendorUpdatedNotification = (vendor) => {
  const io = getIO();

  io.emit("vendor:updated", vendor);
};


const sendProductionStartNotification = (production) => {
  const io = getIO();
  io.emit(
    "production:status-changed",
    production, 
  );
   // normalizeProduction(
    //   productionId,
    //   productionDetails,
    //   "PRODUCTION_STATUS_CHANGED" 
    // )
};

const sendProductionCompleteNotification = (production) => {
  const io = getIO();
  io.emit(
    "production:completed", production
  );
  // normalizeProduction(productionId, productionDetails, "PRODUCTION_COMPLETED")
};


module.exports = {
  sendRawMaterialCreatedNotification,
  sendRawMaterialStatus,
  sendUserCreatedNotification,
  sendCalendarEventCreatedNotification,
  sendVendorCreatedNotification,
  sendVendorUpdatedNotification,
//   sendRawMaterialUpdatedNotification,
  sendProductionStartNotification,
  sendProductionCompleteNotification,
}; 