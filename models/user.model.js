import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import moment from "moment";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["female", "male"],
  },
  user_image: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
  createdAt: {
    type: String,
    default: moment(new Date()).format("ll"),
  },
  liked_posts: [
    {
      type: ObjectId,
      ref: "Post",
    },
  ],
  following: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
});

userSchema.plugin(uniqueValidator);

userSchema.pre("save", async function (next) {
  try {
    const user = this;

    if (this.isModified("password") || this.isNew) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      next();
    }
  } catch (error) {
    next(error);
  }
});

userSchema.statics.comparePasswords = async function (password, cb) {
  const isMatch = await bcrypt.compare(password, this.password);
  console.log(isMatch);
};

export default mongoose.model("User", userSchema);
