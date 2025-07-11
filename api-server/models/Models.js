const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const categorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
});

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "blogposts" }],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Category = mongoose.model("categories", categorySchema);
const Posts = mongoose.model("blogposts", blogPostSchema);
const User = mongoose.model("users", userSchema);

module.exports = { Category, Posts, User };
