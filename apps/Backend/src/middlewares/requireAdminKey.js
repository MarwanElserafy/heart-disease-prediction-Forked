const requireAdminKey = (req, res, next) => {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || String(expected).trim() === "") {
    return res.status(500).json({
      success: false,
      message: "Server misconfiguration: ADMIN_API_KEY is not set",
    });
  }

  const got = req.headers["x-admin-key"];
  if (!got || String(got) !== String(expected)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: admin key is required",
    });
  }

  next();
};

module.exports = { requireAdminKey };

