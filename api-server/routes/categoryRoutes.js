const express = require("express");
const router = express.Router();
const {Category} = require("../models/Models.js");

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Kategoriler alınamadı." });
  }
});

module.exports = router;