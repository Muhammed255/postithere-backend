import { catchError } from "../helper/error_helper.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export default {
  post_comment: async (req, res, next) => {
    try {
      const { comment, postId } = req.body;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, msg: "No post found" });
      }

      post.comments.push({
        comment: comment,
        commentator: authUser._id,
      });
      const postCmt = await post.save();
      return res
        .status(200)
        .json({ success: true, msg: "Comment added!", post: postCmt });
    } catch (err) {
      catchError(res, err);
    }
  },

  update_comment: async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;
      const { comment } = req.body;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const post = await Post.findOne({
        _id: postId,
        "comments._id": commentId,
      });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment not found" });
      }

      const commentData = post.comments.find((c) => {
        return c._id.toString() === commentId.toString();
      });

      if (commentData.commentator.toString() !== req.userId) {
        return res.status(403).json({ success: false, msg: "Not authorized!" });
      }

      if (comment) {
        commentData.comment = comment;
      }

      const updated = await post.save();
      return res
        .status(200)
        .json({ success: true, msg: "Comment updated!", post: updated });
    } catch (err) {
      catchError(res, err);
    }
  },

  delete_comment: async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const post = await Post.findOne({
        _id: postId,
        "comments._id": commentId,
      });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment not found" });
      }

      const commentData = post.comments.find((c) => {
        return c._id.toString() === commentId.toString();
      });

      if (commentData.commentator.toString() !== req.userId) {
        return res.status(403).json({ success: false, msg: "Not authorized!" });
      }

      const commentIndex = post.comments.findIndex((c) => {
        return c._id.toString() === commentId;
      });
      if (commentIndex > -1) {
        post.comments.splice(commentIndex, 1);
      }

      await post.save();
      return res.status(200).json({ success: true, msg: "Comment deleted!" });
    } catch (err) {
      catchError(res, err);
    }
  },

  comment_reply: async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const post = await Post.findOne({
        _id: postId,
        "comments._id": commentId,
      });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment not found" });
      }

      const replyData = {
        "comments.$.replies": {
          reply: req.body.reply,
          replier: req.userId,
        },
      };

      const updated = await Post.findOneAndUpdate(
        { _id: postId, "comments._id": commentId },
        { $addToSet: replyData },
        { new: true, upsert: true }
      );
      return res
        .status(200)
        .json({ success: true, msg: "Reply added!", post: updated });
    } catch (err) {
      catchError(res, err);
    }
  },

  update_comment_reply: async (req, res, next) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const { reply } = req.body;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const post = await Post.findOne({
        _id: postId,
        "comments._id": commentId,
        "comments.replies._id": replyId,
      });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment or reply not found" });
      }

      const reply_data = Object.values(
        post.comments.map((comment) => {
          if (comment._id.toString() === commentId.toString()) {
            return comment.replies.find((reply) => {
              return reply._id.toString() === replyId.toString();
            });
          }
        })
      );

      if (reply_data[0].replier.toString() !== req.userId.toString()) {
        return res.status(403).json({ success: false, msg: "Not authorized!" });
      }
      if (reply) {
        reply_data[0].reply = reply;
      }

      const updated = await post.save();
      return res
        .status(200)
        .json({ success: true, msg: "Reply updated!", post: updated });
    } catch (err) {
      catchError(res, err);
    }
  },

  delete_comment_reply: async (req, res, next) => {
    try {
      const { postId, commentId, replyId } = req.params;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const fetched_post = await Post.findOne({
        _id: postId,
        "comments._id": commentId.toString(),
        "comments.replies._id": replyId.toString()
      });

      if (!fetched_post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment or reply not found" });
      }

      const reply_data = fetched_post.comments.map((comment) => {
        if (comment._id.toString() === commentId.toString()) {
          return comment.replies.find((reply) => {
            return reply._id.toString() === replyId.toString();
          });
        }
      });

      if (reply_data[0].replier.toString() !== req.userId.toString()) {
        return res.status(403).json({ success: false, msg: "Not authorized!" });
      }

      let post = await Post.findOneAndUpdate(
        { _id: postId, "comments._id": commentId, "comments.replies.replier": req.userId.toString() },
        { $pull: { "comments.$.replies": { _id: replyId.toString() } } },
        { new: true, upsert: true }
      )

      return res.status(200).json({ success: true, msg: "Reply deleted!", post });
    } catch (err) {
      catchError(res, err);
    }
  },
};
