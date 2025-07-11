const express = require("express");
const router = express.Router();
const { Posts, Category, User } = require("../models/Models.js");
const multer = require("multer");
const authenticateToken = require("../middleware/auth/authenticateToken.js");
let clients = [];
router.get("/blogposts", async (req, res) => {
  try {
    const posts = await Posts.find().populate("category", "name");
    res.status(200).json(posts);
  } catch (err) {
    console.error("Blog gönderilerini alma hatası:", err);
    res.status(500).json({ error: "Blog gönderileri alınamadı." });
  }
});

router.get("/blogposts/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Bağlantıyı kaydet
  clients.push(res);

  // Bağlantı kapanınca listeden çıkar
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});
function notifyClients(newPost) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(newPost)}\n\n`);
  });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Yükleme dizini
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Dosya adı
  },
});

const upload = multer({ storage: storage });

// Blog oluşturma
router.post(
  "/blogposts",
  authenticateToken,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { title, content, category } = req.body;
      const userId = req.user.userId;
      const imageUrls = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      );
      // Yüklenen dosyaların yollarını al
      const imageUrl = imageUrls.length > 0 ? imageUrls : null; // Eğer dosya yüklenmemişse null yap
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ error: "Kategori bulunamadı." });
      }
      const newPost = new Posts({
        title: title,
        content: content,
        category: category,
        imageUrl: imageUrl,
        createdBy: userId,
      });

      await newPost.save();
      await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
      notifyClients(newPost);
      res.status(201).json({ message: "Blog başarıyla oluşturuldu." });
    } catch (err) {
      console.error("Blog oluşturma hatası:", err);
      res.status(500).json({ error: "Blog oluşturulamadı." });
    }
  }
);

// Kullanıcının kendi postlarını getir
router.get("/blogposts/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Sadece o kullanıcıya ait postları getir
    const posts = await Posts.find({ createdBy: userId }).populate(
      "category",
      "title"
    );
    res.status(200).json(posts);
  } catch (err) {
    console.error("Kullanıcı postlarını alma hatası:", err);
    res.status(500).json({ error: "Kullanıcı postları alınamadı." });
  }
});
module.exports = router;
