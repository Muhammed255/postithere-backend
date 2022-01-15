import cloud from "cloudinary";
import { appConfig } from "../config/app-config.js";

const cloudinaryApi = cloud.v2;

cloudinaryApi.config({
  cloud_name: appConfig.CLOUDINARY_CLOUD_API_NAME,
  api_key: appConfig.CLOUDINARY_CLOUD_API_KEY,
  api_secret: appConfig.CLOUDINARY_CLOUD_API_SECRET
});

export default cloudinaryApi;