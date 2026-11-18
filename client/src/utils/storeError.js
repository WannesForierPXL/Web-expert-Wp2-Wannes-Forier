export function toStoreError(error, fallbackMessage) {
    const serverMessage = error.response?.data?.error?.message;
    const storeError = new Error(serverMessage || fallbackMessage);
    storeError.status = error.response?.status;
    return storeError;
}
