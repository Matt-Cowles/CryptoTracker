import mongoose, { mongo } from "mongoose";
import { Schema } from mongoose;
import passportLocalMongoose from "passport-local-mongoose"

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
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);