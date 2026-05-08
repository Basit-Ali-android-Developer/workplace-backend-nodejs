const cloudinary = require("./cloudinary");

const uploadToCloudinary = async (fileBuffer, folder = "users") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;