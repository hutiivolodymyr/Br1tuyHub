export const ORDER_STATUSES = [
    { value: "new", label: "Нове" },
    { value: "confirmed", label: "Підтверджено" },
    { value: "delivered", label: "Доставлено" },
    { value: "cancelled", label: "Скасовано" },
];

export const STATUS_LABELS = ORDER_STATUSES.reduce((acc, status) => {
    acc[status.value] = status.label;
    return acc;
}, {});

export const NEXT_STATUSES = {
    new: ["confirmed", "cancelled"],
    confirmed: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;
