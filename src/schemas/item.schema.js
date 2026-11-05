const { z } = require("zod");

const createItemSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(150, "Nama maksimal 150 karakter"),
  description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter").nullable().optional(),
  stock: z.number().int("Stok harus bilangan bulat").min(0, "Stok tidak boleh negatif"),
  // Decimal(12,2) di database: maksimal 10 digit sebelum koma
  price: z.number().min(0, "Harga tidak boleh negatif").max(9999999999.99, "Harga terlalu besar"),
});

// Untuk PUT: semua field opsional, tapi minimal satu harus dikirim
const updateItemSchema = createItemSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi",
  });

const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1, "page minimal 1").default(1),
  limit: z.coerce.number().int().min(1, "limit minimal 1").max(100, "limit maksimal 100").default(10),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive("id tidak valid"),
});

module.exports = { createItemSchema, updateItemSchema, listQuerySchema, idParamSchema };