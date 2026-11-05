const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  // Maks 72 karena bcrypt hanya memproses 72 byte pertama dari password
  password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password maksimal 72 karakter"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

module.exports = { registerSchema, loginSchema };