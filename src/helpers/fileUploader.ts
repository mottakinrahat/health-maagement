import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

cloudinary.config({
  cloud_name: "dse4w3es9",
  api_key: "954471851851321",
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const uploadToCloudinary = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "uploads",
  });

  return { url: result.secure_url };
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
