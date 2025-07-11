const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/Models.js").User;
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, surname, username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tüm alanlar gereklidir" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanılıyor" });
    }

    const user = new User({ name, surname, username, email, password });
    await user.save();

    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu" });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
