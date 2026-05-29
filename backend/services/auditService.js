const pool = require("../db");

const logAdminAction = async ({
    adminId,
    action,
    entityType,
    entityId,
    details = {},
}) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs
            (admin_id, action, entity_type, entity_id, details)
            VALUES ($1, $2, $3, $4, $5)`,
            [adminId, action, entityType, entityId, JSON.stringify(details)]
        );
    } catch (error) {
        console.error("Audit log error:", error);
    }
};

module.exports = {
    logAdminAction,
};
