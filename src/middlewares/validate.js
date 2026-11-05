// Pembungkus validasi: skema apa pun bisa dipasang untuk body, query, atau params.
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      message: "Validasi gagal",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (source === "body") {
    // Ganti body dengan data yang sudah dibersihkan (trim, lowercase, field asing dibuang)
    req.body = result.data;
  } else {
    // req.query di Express versi baru tidak bisa ditimpa, jadi hasilnya disimpan terpisah
    req.validated = { ...req.validated, [source]: result.data };
  }

  next();
};

module.exports = validate;