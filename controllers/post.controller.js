import cloudinaryApi from "../helper/cloudinary-api.js";
import { catchError } from "../helper/error_helper.js";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export default {
  create_post: async (req, res, next) => {
    try {
      const { content } = req.body;
      const authUser = await User.findOne({ _id: req.user._id });
      if (!authUser) {
        return res.status(400).json({ success: false, msg: "Unauthorized!" });
      }
      const post = new Post();
      if (content) {
        post.content = content;
      }
      if (req.file) {
        const imageResult = await cloudinaryApi.uploader.upload(
          req.file.path,
          {
            folder: "post-it-here/posts",
          }
        );
        post.image = imageResult.secure_url;
        post.cloudinary_id = imageResult.public_id;
      }
      post.creator = req.user._id;
      let group_post = false;

      if (req.params.groupId) {
        post.groupId = req.params.groupId;
        group_post = true;
      }
      const newPost = await post.save();
      return res
        .status(200)
        .json({ success: true, msg: group_post ? "Group Post created!" : "Post created!", post: newPost });
    } catch (err) {
      catchError(res, err);
    }
  },

  getPost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId).populate({
        path: "creator",
        select: "-password -__v",
      });
      if (!post) {
        return res.status(404).json({ success: false, msg: "No post found!" });
      }

      return res.status(200).json({ success: true, msg: "Post fetched", post });
    } catch (err) {
      catchError(res, err);
    }
  },

  getPosts: async (req, res, next) => {
    try {
      const posts = await Post.find().populate({
        path: "creator",
        select: "-password -__V",
      }).populate("groupId");
      res
        .status(200)
        .json({ success: true, msg: "Posts fetched!", posts: posts });
    } catch (err) {
      catchError(res, err);
    }
  },

  getLoggedInPosts: async (req, res, next) => {
    try {
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(400).json({ success: false, msg: "Unauthorized!" });
      }
      console.log("dDDDDD");
      const posts = await Post.find({ creator: authUser._id }).populate({
        path: "creator",
        select: "-password -__v",
      });
      return res
        .status(200)
        .json({ success: true, msg: "Posts fetched!", posts: posts });
    } catch (err) {
      catchError(res, err);
    }
  },

  update_post: async (req, res, next) => {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const post = await Post.findById(postId).populate("creator");
      if (!post) {
        return res.status(404).json({ success: false, msg: "No post found!" });
      }
      if (post.creator._id.toString() !== req.userId) {
        return res.status(403).json({ success: false, msg: "Not authorized!" });
      }

      if (content) {
        post.content = content;
      }
      if (post.cloudinary_id && post.image) {
        await cloudinaryApi.uploader.destroy(post.cloudinary_id, {
          invalidate: true,
          resource_type: "image",
        });
        post.image = "";
        post.cloudinary_id = "";
      }
      if (req.file) {
        const imageResult = await cloudinaryApi.uploader.upload(req.file.path, {
          folder: "post-it-here/posts",
        });
        post.image = imageResult.secure_url;
        post.cloudinary_id = imageResult.public_id;
      }
      const result = await post.save();
      return res
        .status(200)
        .json({ success: true, msg: "Post updated", post: result });
    } catch (err) {
      catchError(res, err);
    }
  },

  delete_post: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, msg: "No post found!" });
      }
      if (post.creator.toString() !== req.userId) {
        return res.status(403).json({ success: false, msg: "Not authorized!" });
      }
      if (post.image || post.cloudinary_id) {
        await cloudinaryApi.uploader.destroy(post.cloudinary_id, {
          invalidate: true,
          resource_type: "image",
        });
      }
      await Post.findOneAndRemove({ _id: post._id, creator: req.userId });
      return res.status(200).json({ success: true, msg: "Post deleted!" });
    } catch (err) {
      catchError(res, err);
    }
  },
};
