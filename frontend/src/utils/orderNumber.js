export const formatOrderNumber = (orderId) =>
    `BH-${String(orderId).padStart(6, "0")}`;
