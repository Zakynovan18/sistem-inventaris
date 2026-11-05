function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      message: "Data sudah ada (duplikat)",
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Format JSON tidak valid",
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
  });
}

module.exports = errorHandler;