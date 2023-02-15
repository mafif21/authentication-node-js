const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/secretapp";
const encrypt = require("mongoose-field-encryption").fieldEncryption;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: String,
});

userSchema.plugin(encrypt, {
  fields: ["password"],
  secret: "randomstringforscretkey",
});

const User = mongoose.model("user", userSchema);

module.exports = User;
