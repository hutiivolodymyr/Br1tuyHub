const getAdminPanel = async (req, res) => {
    res.json({
        message: "Admin panel route works",
        user: req.user,
    });
};

module.exports = {
    getAdminPanel,
};