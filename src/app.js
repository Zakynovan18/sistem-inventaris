require("dotenv/config");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const errorHandler = require("./middlewares/errorHandler");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET belum diisi di file .env");
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);

app.use((req, res) => res.status(404).json({ message: "Endpoint tidak ditemukan" }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));