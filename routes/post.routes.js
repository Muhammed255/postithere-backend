import express from "express";
import commentController from "../controllers/comment.controller.js";

import postController from "../controllers/post.controller.js";
import reactController from "../controllers/react.controller.js";
import { fileUpload } from "../middleware/file-upload.js";

import { decode } from "../middleware/jwt.js";

export const postRoutes = express.Router();

// get all posts
postRoutes.get("/all-posts", postController.getPosts);

// get auth user posts
postRoutes.get("/logged-posts", decode, postController.getLoggedInPosts);

// get single post
postRoutes.get("/:postId", postController.getPost);

// add new post
postRoutes.post(
  "/new-post",
  decode,
  fileUpload.single("image"),
  postController.create_post
);

// add new group post
postRoutes.post(
  "/new-post/?:groupId",
  decode,
  fileUpload.single("image"),
  postController.create_post
);

// Comment on post
postRoutes.post("/comment", decode, commentController.post_comment);

// reply on Comment
postRoutes.post(
  "/reply-comment/:postId/:commentId",
  decode,
  commentController.comment_reply
);

// like post
postRoutes.post("/like-post/:postId", decode, reactController.like_post);

// like comment
postRoutes.post(
  "/like-comment/:postId/:commentId",
  decode,
  reactController.like_comment
);

// like reply
postRoutes.post(
  "/like-reply/:postId/:commentId/:replyId",
  decode,
  reactController.like_reply
);

// update post
postRoutes.put(
  "/:postId",
  decode,
  fileUpload.single("image"),
  postController.update_post
);

// update comment
postRoutes.put("/:postId/:commentId", decode, commentController.update_comment);

// update reply on comment
postRoutes.put(
  "/reply-comment/:postId/:commentId/:replyId",
  decode,
  commentController.update_comment_reply
);

// delete post
postRoutes.delete("/:postId", decode, postController.delete_post);

// delete comment
postRoutes.delete(
  "/:postId/:commentId",
  decode,
  commentController.delete_comment
);

// delete comment reply
postRoutes.delete(
  "/reply-comment/:postId/:commentId/:replyId",
  decode,
  commentController.delete_comment_reply
);
