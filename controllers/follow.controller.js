import { catchError } from "../helper/error_helper.js";
import User from "../models/user.model.js";

export default {
  follow_user: async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (userId === req.userId) {
        return res.status(400).json({ msg: "You can not follow yourself!" });
      }

      const following_query = {
        _id: req.userId,
        following: { $not: { $elemMatch: { $eq: userId } } },
      };

      const following_update = {
        $addToSet: { following: userId },
      };

      const addedToFollowing = await User.updateOne(
        following_query,
        following_update
      );

      const followers_query = {
        _id: userId,
        followers: { $not: { $elemMatch: { $eq: req.userId } } },
      };

      const followers_update = {
        $addToSet: { followers: req.userId },
      };

      const addedToFollowers = await User.updateOne(
        followers_query,
        followers_update
      );

      if (!addedToFollowing || !addedToFollowers) {
        return res
          .status(400)
          .json({ msg: "Unable to follow that user, try again later!" });
      }

      return res.status(200).json({ msg: "Followed!" });
    } catch (err) {
      catchError(res, err);
    }
  },

  unfollow_user: async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (userId === req.userId) {
        return res.status(400).json({ msg: "You can not unfollow yourself!" });
      }

      const following_query = {
        _id: req.userId,
        following: { $elemMatch: { $eq: userId } },
      };

      const following_update = {
        $pull: { following: userId },
      };

      const removeFromFollowing = await User.updateOne(
        following_query,
        following_update
      );

      const followers_query = {
        _id: userId,
        followers: { $elemMatch: { $eq: req.userId } },
      };

      const followers_update = {
        $pull: { followers: req.userId },
      };

      const removeFromFollowers = await User.updateOne(
        followers_query,
        followers_update
      );

      if (!removeFromFollowing || !removeFromFollowers) {
        return res
          .status(400)
          .json({ msg: "Unable to unfollow that user, try again later!" });
      }

      return res.status(200).json({ msg: "UnFollowed!" });
    } catch (err) {
      catchError(res, err);
    }
  },
};
