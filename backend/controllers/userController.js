const getProfile = async (req, res) => {
    res.json({
        message: "Protected profile route works",
        user: req.user,
    });
};

module.exports = {
    getProfile,
};