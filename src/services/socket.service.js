let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => {
  return ioInstance;
};

export const emitToCompany = (companyId, event, payload) => {
  if (!ioInstance || !companyId) return;

  ioInstance.to(companyId.toString()).emit(event, payload);
};