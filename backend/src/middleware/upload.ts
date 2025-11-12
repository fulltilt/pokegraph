import multer from "multer";
import { config } from "../config";

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.uploadLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
