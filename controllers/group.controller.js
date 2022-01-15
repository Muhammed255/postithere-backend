import { catchError } from "../helper/error_helper.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export default {
  create_group: async (req, res, next) => {
    try {
      const { name, type, description } = req.body;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const newGroup = new Group({
        name: name,
        type: type,
        description: description,
        user: authUser._id,
        members: [
          {
            userId: authUser._id,
            isVerified: true,
          },
        ],
        admins: [authUser._id],
        moderators: [],
      });
      const group = await newGroup.save();
      return res
        .status(200)
        .json({ success: true, msg: "Group created!", group });
    } catch (err) {
      catchError(res, err);
    }
  },

  get_group: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const group = await Group.findOne({
        _id: groupId,
      })
        .populate({ path: "members", select: "-password -__v -createdAt" })
        .populate({ path: "user", select: "-password -__v -createdAt" })
        .populate({ path: "admins", select: "-password -__v -createdAt" })
        .populate({ path: "moderators", select: "-password -__v -createdAt" });
      if (!group) {
        return res.status(404).json({ success: false, msg: "No group found" });
      }
      return res
        .status(200)
        .json({ success: true, msg: "Group fetched!", group });
    } catch (err) {
      catchError(res, err);
    }
  },

  get_single_group: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const group = await Group.findOne({
        _id: groupId,
        members: { $elemMatch: { userId: req.userId } },
      })
        .populate({ path: "members", select: "-password -__v -createdAt" })
        .populate({ path: "user", select: "-password -__v -createdAt" })
        .populate({ path: "admins", select: "-password -__v -createdAt" })
        .populate({ path: "moderators", select: "-password -__v -createdAt" });
      if (!group) {
        return res.status(404).json({ success: false, msg: "No group found" });
      }
      return res
        .status(200)
        .json({ success: true, msg: "Group fetched!", group });
    } catch (err) {
      catchError(res, err);
    }
  },

  get_joined_groups: async (req, res, next) => {
    try {
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      const groups = await Group.find({
        members: [{ userId: req.userId }],
        "members.isVerified": true,
      });
      if (!groups) {
        return res.status(404).json({ success: false, msg: "No groups found" });
      }
      return res
        .status(200)
        .json({ success: true, msg: "Groups fetched!", groups });
    } catch (err) {
      catchError(res, err);
    }
  },

  update_group: async (req, res, next) => {
    try {
      const { name, type, description } = req.body;
      const group = await Group.findOne({
        _id: req.params.groupId,
        admins: { $in: [req.userId] },
      });
      if (!group) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }
      if (name) {
        group.name = name;
      }
      if (type) {
        group.type = type;
      }
      if (description) {
        group.description = description;
      }

      await group.save();
      return res.status(200).json({ success: true, msg: "Group updated!" });
    } catch (err) {
      catchError(res, err);
    }
  },

  invite_member: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, msg: "Please provide userId" });
      }

      const group = await Group.findOne({ _id: groupId });
      if (!group) {
        return res
          .status(402)
          .json({ success: false, msg: "Group not found!" });
      }

      const result = await Group.findOneAndUpdate(
        {
          _id: groupId,
          admins: { $in: [req.userId] },
        },
        { $push: { members: { userId: userId } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ success: true, msg: "Invite sent!", group: result });
    } catch (err) {
      catchError(res, err);
    }
  },

  get_pending_groups: async (req, res, next) => {
    try {
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const groups = await Group.find({
        "members.userId": authUser._id,
        "members.isVerified": false,
      });
      if (!groups) {
        return res
          .status(404)
          .json({ success: false, msg: "No pending groups found" });
      }

      return res
        .status(200)
        .json({ success: true, msg: "Groups fetched", groups });
    } catch (err) {
      catchError(res, err);
    }
  },

  accept_group_invite: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const group = await Group.findOne({ _id: groupId });
      if (!group) {
        return res.status(404).json({ success: false, msg: "No group found" });
      }

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized!" });
      }

      const gruopToJoin = await Group.findOneAndUpdate(
        { _id: groupId, "members.isVerified": false },
        { $set: { "members.$.isVerified": true } },
        { new: true }
      );
      if (!gruopToJoin) {
        return res
          .status(401)
          .json({ success: false, msg: "you already member!" });
      }

      return res
        .status(200)
        .json({ success: true, msg: "Joined!", group: gruopToJoin });
    } catch (err) {
      catchError(res, err);
    }
  },

  remove_member: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, msg: "Please provide a userId" });
      }
      const group_admin = await Group.findOne({
        _id: groupId,
        admins: { $in: [req.body.userId] },
      });
      const group_moderator = await Group.findOne({
        _id: groupId,
        moderators: { $in: [req.body.userId] },
      });

      if (group_admin || group_moderator) {
        return res
          .status(403)
          .json({ success: false, msg: "Member can not be removed!" });
      }
      const group = await Group.updateOne(
        { _id: groupId, admins: [req.userId] },
        { $pull: { members: { userId: userId } } }
      );

      return res
        .status(200)
        .json({ success: true, msg: "member removed!", group });
    } catch (err) {
      catchError(res, err);
    }
  },

  add_moderator: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { memberId } = req.body;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized" });
      }

      if (!memberId) {
        return res
          .status(400)
          .json({ success: false, msg: "Please provide memberId" });
      }

      const group = await Group.findOne({
        _id: groupId,
        members: { $elemMatch: { userId: memberId, isVerified: true } },
      });
      if (!group) {
        return res
          .status(402)
          .json({ success: false, msg: "Group not found!" });
      }

      const result = await Group.findOneAndUpdate(
        {
          _id: groupId,
          admins: { $in: [req.userId] },
        },
        { $addToSet: { moderators: memberId } },
        { new: true }
      );

      if (!result) {
        return res.status(401).json({
          success: false,
          msg: "you Can not make this person as moderator",
        });
      }

      return res
        .status(200)
        .json({ success: true, msg: "added as moderator!", group: result });
    } catch (err) {
      catchError(res, err);
    }
  },

  remove_moderator: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { moderatorId } = req.body;

      if (!moderatorId) {
        return res
          .status(400)
          .json({ success: false, msg: "Please provide moderatorId" });
      }

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized" });
      }

      const check_group = await Group.findOne({
        _id: groupId
      });
      if (!check_group) {
        return res
          .status(402)
          .json({ success: false, msg: "Group not found!" });
      }

      const group = await Group.findOneAndUpdate(
        { _id: groupId, admins: [req.userId] },
        { $pull: { moderators: moderatorId } },
        { new: true }
      );

      if (!group) {
        return res.status(401).json({ success: false, msg: "Can not remove" });
      }
      return res
        .status(200)
        .json({ success: true, msg: "Moderator removed!", group });
    } catch (err) {
      catchError(res, err);
    }
  },

  add_admin: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { memberId } = req.body;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized" });
      }

      if (!memberId) {
        return res
          .status(400)
          .json({ success: false, msg: "Please provide memberId" });
      }

      const group = await Group.findOne({
        _id: groupId,
        members: { $elemMatch: { userId: memberId, isVerified: true } },
      });
      if (!group) {
        return res
          .status(402)
          .json({ success: false, msg: "Group not found!" });
      }

      const result = await Group.findOneAndUpdate(
        {
          _id: groupId,
          admins: { $in: [req.userId] },
        },
        { $addToSet: { admins: memberId } },
        { new: true }
      );

      if (!result) {
        return res.status(401).json({
          success: false,
          msg: "you Can not make this person as admin",
        });
      }

      return res
        .status(200)
        .json({ success: true, msg: "added as admin!", group: result });
    } catch (err) {
      catchError(res, err);
    }
  },

  remove_admin: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { adminId } = req.body;

      if (!adminId) {
        return res
          .status(400)
          .json({ success: false, msg: "Please provide adminId" });
      }

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(402).json({ success: false, msg: "Not authorized" });
      }

      const check_group = await Group.findOne({
        _id: groupId
      });
      if (!check_group) {
        return res
          .status(402)
          .json({ success: false, msg: "Group not found!" });
      }

      const group = await Group.findOneAndUpdate(
        { _id: groupId, admins: { $in: [req.userId] }, },
        { $pull: { admins: adminId } },
        { new: true }
      );

      if (!group) {
        return res.status(401).json({ success: false, msg: "Can not remove" });
      }
      return res
        .status(200)
        .json({ success: true, msg: "Admin removed!", group });
    } catch (err) {
      catchError(res, err);
    }
  },
};
