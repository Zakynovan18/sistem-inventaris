const prisma = require("../lib/prisma");

async function createItem(req, res, next) {
  try {
    const item = await prisma.item.create({
      data: { ...req.body, userId: req.user.id },
    });
    return res.status(201).json({ message: "Barang berhasil ditambahkan", data: item });
  } catch (err) {
    next(err);
  }
}

async function listItems(req, res, next) {
  try {
    const { search, page, limit } = req.validated.query;

    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Dua query dijalankan bersamaan datanya, dan total untuk hitung jumlah halaman
    const [items, totalItems] = await Promise.all([
      prisma.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return res.status(200).json({
      data: items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { id } = req.validated.params;

    // Cari berdasarkan id dan pemilik. Barang milik user lainya dianggap tidak ada.
    const existing = await prisma.item.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    const item = await prisma.item.update({ where: { id }, data: req.body });
    return res.status(200).json({ message: "Barang berhasil diperbarui", data: item });
  } catch (err) {
    next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    const { id } = req.validated.params;

    const existing = await prisma.item.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    await prisma.item.delete({ where: { id } });
    return res.status(200).json({ message: "Barang berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createItem, listItems, updateItem, deleteItem };