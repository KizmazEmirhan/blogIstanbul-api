require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const categoryRoutes = require("./routes/categoryRoutes");
const postRoutes = require("./routes/postRoutes");
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");

// Express uygulamasını başlat
const app = express();

// Middleware'ler

app.use(express.json({ limit: "50mb" })); // JSON veri sınırı
app.use(express.urlencoded({ limit: "50mb", extended: true })); // URL Encoded veri sınırı
app.use(cors());
app.use("/uploads", express.static("uploads")); // Yüklenen dosyaların statik olarak sunulması
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Yüklenen dosyaların statik olarak sunulması
// Rotalar
app.use("/api", categoryRoutes);
app.use("/api", postRoutes);
app.use("/api", loginRoutes); // Giriş rotası
app.use("/api", registerRoutes); // Kayıt rotası

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas bağlantısı başarılı!"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});
