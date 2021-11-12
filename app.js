require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
const app = express();
app.use(express.json());

app.post("/audio/upload", async (req, res) => {
  const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      const fileExt = file.originalname.split(".").pop();
      const filename = `${new Date().getTime()}.${fileExt}`;
      cb(null, filename);
    },
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
      cb(null, true);
    } else {
      cb({ message: "Unsupported File Format" }, false);
    }
  };

  const upload = multer({
    storage,
    limits: { fieldNameSize: 200, fileSize: 5 * 1024 * 1024 },
    fileFilter,
  }).single("audio");
  upload(req, res, (err) => {
    if (err) {
      return res.send(err);
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { path } = req.file;
    const fName = req.file.originalname.split(".")[0];
    cloudinary.uploader.upload(
      path,
      { resource_type: "raw", public_id: `AudioUploads/${fName}` },
      (err, audio) => {
        if (err) return res.send(err);

        fs.unlinkSync(path);
        res.send(audio);
      }
    );
  });
});

module.exports = app;
