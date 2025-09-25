const moongoose = require("mongoose");

const userShcsema = new moongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  password2: { type: String, required: true },
  role: { type: String, default: "user", required: true },
});

const user = moongoose.model("users", userShcsema);
module.exports = user;
