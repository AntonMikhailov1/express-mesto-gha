// models/like.js
const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  like: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: [],
  },
});

module.exports = mongoose.model("like", likeSchema);
