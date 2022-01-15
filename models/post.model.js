import mongoose from "mongoose";
import moment from "moment";

const { Schema, model } = mongoose;

// Validate Function to check comment length
let commentLengthChecker = (comment) => {
  // Check if comment exists
  if (!comment[0]) {
    return false; // Return error
  } else {
    // Check comment length
    if (comment[0].length < 1 || comment[0].length > 200) {
      return false; // Return error if comment length requirement is not met
    } else {
      return true; // Return comment as valid
    }
  }
};

// Array of Comment validators
const commentValidators = [
  // First comment validator
  {
    validator: commentLengthChecker,
    message: "Comments may not exceed 200 characters.",
  },
];

const ObjectId = Schema.Types.ObjectId;

const postSchema = new Schema({
  content: {
    type: String,
  },
  image: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
  creator: { type: ObjectId, ref: "User" },
  comments: [
    {
      comment: { type: String, validate: commentValidators },
      commentator: { type: ObjectId, ref: "User" },
      comment_date: { type: String, default: moment(new Date()).format("ll") },
      likedBy: [{ type: ObjectId, ref: "User" }],
      likes: { type: Number, default: 0 },
      replies: [
        {
          reply: { type: String, validate: commentValidators },
          replier: { type: ObjectId, ref: "User" },
          reply_date: {
            type: String,
            default: moment(new Date()).format("ll"),
          },
          likedBy: [{ type: ObjectId, ref: "User" }],
          likes: { type: Number, default: 0 },
        },
      ],
    },
  ],
  created_at: {
    type: String,
    default: moment(new Date()).format("ll"),
  },
  likedBy: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  groupId: {
    type: ObjectId,
    ref: "Group"
  }
});

export default model("Post", postSchema);
