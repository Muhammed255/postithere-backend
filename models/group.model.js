import moment from "moment";
import mongoose from "mongoose";

const { Schema, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const groupSchema = new Schema({
  name: {
    type: String,
    required: "Group name is required",
    maxlength: [25, "Not more than 25 Characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [120, "Not more than 120 Characters"],
  },
  type: {
    type: String,
    enum: ["PRIVATE", "PUBLIC", "CLOSED"],
    default: "PUBLIC",
    required: "Group type is required",
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
  posts: [
    {
      type: ObjectId,
      ref: "Post",
    },
  ],
  members: [
    {
      userId: { type: ObjectId, ref: "User" },
      isVerified: { type: Boolean, default: false },
    },
  ],
  admins: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  moderators: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: String,
    default: moment(new Date()).format("ll"),
  },
});

export default model("Group", groupSchema);
