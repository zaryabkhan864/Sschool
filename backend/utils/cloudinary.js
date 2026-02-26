import cloudinary from "cloudinary";
import dotenv from "dotenv";
import { nanoid } from "nanoid";

dotenv.config({ path: "backend/config/config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload_file = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "image",
      public_id: `school/avatars/avatar_${nanoid(8)}`, // 🔥 Folder forced inside public_id
    });

    console.log("Cloudinary result:", result);

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const delete_file = async (publicId) => {
  const res = await cloudinary.uploader.destroy(publicId);
  return res?.result === "ok";
};