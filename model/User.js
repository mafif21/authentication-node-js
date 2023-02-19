const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/secretapp";
const encrypt = require("mongoose-field-encryption").fieldEncryption;
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
require("dotenv").config();

mongoose.set("strictQuery", false);
mongoose.connect(url);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  secret: [],
});

userSchema.plugin(findOrCreate);
userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {
//   fields: ["password"],
//   secret: process.env.SECRET_KEY,
// });

const User = mongoose.model("user", userSchema);

module.exports = User;
