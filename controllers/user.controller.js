import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { appConfig } from "../config/app-config.js";
import { isValidEmail } from "../helper/check-mail.js";
import PassToken from "../models/pass-token.model.js";
import User from "../models/user.model.js";
import { catchError } from "../helper/error_helper.js";
import cloudinaryApi from "../helper/cloudinary-api.js";

export default {
  signup: async (req, res, next) => {
    try {
      const { name, email, password, gender } = req.body;
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, msg: "Invalid Email!" });
      }
      const checkExist = await User.findOne({ email: email });
      if (checkExist) {
        return res
          .status(401)
          .json({ success: false, msg: "Email already registered!" });
      }

      const newUser = new User({ name, email, password, gender });

      if (req.file) {
        const imageResult = await cloudinaryApi.uploader.upload(req.file.path, {
          folder: "post-it-here/users",
        });
        newUser.user_image = imageResult.secure_url;
        newUser.cloudinary_id = imageResult.public_id;
      }

      const user = await newUser.save();
      const token = jwt.sign(
        { userId: newUser._id, user: newUser },
        appConfig.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({ user, token });
    } catch (error) {
      catchError(res, err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, msg: "Invalid Email!" });
      }
      const checkExists = await User.findOne({ email });
      if (!checkExists) {
        return res
          .status(401)
          .json({ success: false, msg: "Unregistered Email" });
      }
      const isMatch = await bcrypt.compare(password, checkExists.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, msg: "Password is incorrect!" });
      }
      const token = jwt.sign(
        { userId: checkExists._id, user: checkExists },
        appConfig.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        userId: checkExists._id,
        token: token,
      });
    } catch (error) {
      catchError(res, err);
    }
  },

  askResetPassword: async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, msg: "User with that email not found" });
      }
      let token = await PassToken.findOne({ userId: user._id });
      if (!token) {
        token = await new PassToken({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
      }

      const link =
        appConfig.BACKEND_URL +
        "/password-reset/" +
        user._id +
        "/" +
        token.token;
      res
        .status(200)
        .json({ success: true, mg: "Password Reset configured!", url: link });
    } catch (err) {
      catchError(res, err);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { userId, tokenId } = req.params;
      const user = await User.findById(userId);
      if (!user)
        return res.status(400).json({ success: false, msg: "user not found" });
      const token = await PassToken.findOne({
        userId: user._id,
        token: tokenId,
      });
      if (!token)
        return res
          .status(400)
          .json({ success: false, msg: "invalid link or expired" });
      user.password = req.body.newPass;
      await user.save();
      await token.delete();
      return res
        .status(200)
        .json({ success: true, msg: "Password reset successfully!" });
    } catch (err) {
      catchError(res, err);
    }
  },

  update_profile: async (req, res, next) => {
    try {
      const { name, email } = req.body;
      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(404).json({ msg: "No user found!" });
      }
      if (email) {
        if (!isValidEmail(email)) {
          return res.status(400).json({ msg: "Invalid email!" });
        }
        authUser.email = email;
      }
      if (name) {
        authUser.name = name;
      }

      await authUser.save();
      return res.status(200).json({ msg: "profile updated!" });
    } catch (err) {
      catchError(res, err);
    }
  },
  update_password: async (req, res, next) => {
    try {
      const { oldPass, newPass } = req.body;

      const authUser = await User.findById(req.userId);
      if (!authUser) {
        return res.status(404).json({ msg: "No user found!" });
      }
      const isMatch = await bcrypt.compare(oldPass, authUser.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Old password is incorrect!!" });
      }

      authUser.password = newPass;
      await authUser.save();
      return res.status(200).json({ msg: "Password updated!" });
    } catch (err) {
      catchError(res, err);
    }
  },
};
