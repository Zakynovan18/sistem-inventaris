const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      // select: password tidak pernah ikut dikembalikan
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return res.status(201).json({ message: "Registrasi berhasil", data: user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatch = user && (await bcrypt.compare(password, user.password));

    // Pesan sama untuk "email tidak ada" dan "password salah",
    // agar hacker tidak mengenali email yang terdaftar.
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login berhasil",
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };