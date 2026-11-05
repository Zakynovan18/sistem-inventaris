const jwt = require("jsonwebtoken");
// hanya request dengan token JWT sah yang boleh lewat.
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = header.slice(7); // buang "Bearer "

  try {
    // verify memeriksa tanda tangan dan masa berlaku sekaligus
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub) };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
}

module.exports = auth;