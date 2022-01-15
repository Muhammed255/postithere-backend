import jwt from "jsonwebtoken";
import { appConfig } from "../config/app-config.js";

export const decode = (req, res, next) => {
  if (!req.headers["authorization"]) {
    return res
      .status(400)
      .json({ success: false, message: "No access token provided" });
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(accessToken, appConfig.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded.user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized !!" });
  }
};
