import { catchError } from "../helper/error_helper.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export default {
  like_post: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const post = await Post.findById(postId).populate("creator");
      if (!post) {
        returnres.status(404).json({ success: false, msg: "No post found" });
      }

      if (post.likedBy.includes(authUser._id)) {
        post.likes--;
        const userIndex = post.likedBy.indexOf(authUser._id);
        const postIndex = authUser.liked_posts.indexOf(post._id);
        post.likedBy.splice(userIndex, 1);
        authUser.liked_posts.splice(postIndex, 1);
        await post.save();
        await authUser.save();
        return res
          .status(200)
          .json({ success: true, msg: "Post like removed!" });
      } else {
        post.likes++;
        post.likedBy.push(authUser._id);
        authUser.liked_posts.push(post._id);
        await post.save();
        await authUser.save();
        return res.status(200).json({ success: true, msg: "Post liked!" });
      }
    } catch (err) {
      catchError(res, err);
    }
  },

  like_comment: async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const post = await Post.findOne({
        _id: postId,
        "comments._id": commentId,
      }).populate("creator");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment not found!" });
      }

      for (let index = 0; index < post.comments.length; index++) {
        const comment = post.comments[index];
        if (comment.likedBy.includes(authUser._id)) {
          await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            {
              $pull: { "comments.$.likedBy": authUser._id },
              $inc: { "comments.$.likes": -1 },
            },
            {new: true, upsert: true}
          );
          return res
            .status(200)
            .json({ success: true, msg: "Comment like removed!" });
        } else {
          await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            {
              $push: { "comments.$.likedBy": authUser._id },
              $inc: { "comments.$.likes": 1 },
            },
            {new: true, upsert: true}
          );
          return res.status(200).json({ success: true, msg: "Comment liked!" });
        }
      }
    } catch (err) {
      catchError(res, err);
    }
  },

  like_reply: async (req, res, next) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const post = await Post.findOne({
        _id: postId,
        "comments._id": commentId,
        "comments.replies._id": replyId,
      }).populate("creator");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, msg: "Post or comment or reply not found!" });
      }

      for (let index = 0; index < post.comments.length; index++) {
        const comment = post.comments[index];
        for (let ele = 0; ele < comment.replies.length; ele++) {
          const reply = comment.replies[ele];
          if (reply.likedBy.includes(authUser._id)) {
            reply.likes--;
            const userIndex = reply.likedBy.indexOf(authUser._id);
            if(userIndex > -1) {
              reply.likedBy.splice(userIndex, 1);
            }
            await post.save();
            return res.status(200).json({success: true, msg: "reply like removed!"});
          } else {
            reply.likes++;
            reply.likedBy.push(authUser._id);
            await post.save();
            return res.status(200).json({success: true, msg: "reply liked!"});
          }
        }
      }
    } catch (err) {
      catchError(res, err);
    }
  },
};
