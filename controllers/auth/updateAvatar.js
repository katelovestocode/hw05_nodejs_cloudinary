const fs = require("fs/promises");
const { User } = require("../../models/users");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

// cloudinary configurations
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const updateAvatar = async (req, res, next) => {
  // get avatar path name from req.file
  const { path: tempUpload } = req.file;
  // console.log(req.file);
  const { _id } = req.user;

  try {
    // move image from temp folder into a cloud, folder: Avatars
    const getImage = await cloudinary.uploader.upload(tempUpload, {
      folder: "Avatars",
      transformation: { width: 250, crop: "fill" },
    });

    const { secure_url: avatarURL, public_id: cloudIdAvatar } = getImage;

    // find a current user by id
    const user = await User.findOne(_id);

    // delete an old image in the cloud before uploading a new one
    await cloudinary.uploader.destroy(user.cloudIdAvatar, (err, result) => {
      console.log(err);
      console.log(result);
    });

    // update user information in database
    await User.findByIdAndUpdate(_id, {
      avatarURL,
      cloudIdAvatar,
    });

    // delete file from the temp folder
    await fs.unlink(req.file.path);

    res.json({ avatarURL, cloudIdAvatar });
  } catch (error) {
    // if we can't move file from the temp folder, then just delete it from temp folder
    await fs.unlink(req.file.path);
    throw error;
  }
};

module.exports = updateAvatar;
