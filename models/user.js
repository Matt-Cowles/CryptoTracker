import mongoose from "mongoose";
const { Schema } = mongoose;
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  favorites: [String],
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);
export default User;
