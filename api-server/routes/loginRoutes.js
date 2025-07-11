const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Models.js").User; // Kullanıcı modelini içe aktar
const router = express.Router();
require("dotenv").config();
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-posta ve şifre gereklidir" });
  }

  try {
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token });

    return res.status(200).json({
      message: "Giriş başarılı",
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
