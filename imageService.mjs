import sharp from 'sharp';
// import { removeBackground } from "@imgly/background-removal-node";
import axios from "axios";
import AWS from 'aws-sdk';

const stickerBucket = 'whatsappstickers';
const region = 'eu-west-1';
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_KEY_SECRET,
  region 
});

export const getProcessedSticker = async (url) => {
  // let buffer = await removeBackgroundOfImage(url);
  let buffer = await convertImageFromUrlToBuffer(url);
  buffer = await convertImageToWebp(buffer);
  const urlOnS3 = await uploadImageToS3(buffer);
  return urlOnS3;
}

const convertImageFromUrlToBuffer = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

const removeBackgroundOfImage = async (url) => {
  const blob = await removeBackground(url);
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

const convertImageToWebp = async (buffer) => {
    const webpBuffer = await sharp(buffer).webp().toBuffer();
    return webpBuffer
}

const uploadImageToS3 = async (buffer) => {
  try {
    const uploadParams = {
      Bucket: stickerBucket, 
      Key: `image-${Date.now()}.webp`,
      Body: buffer,
      ContentType: 'image/webp'
    };
    await s3.upload(uploadParams).promise();
    const imageUrlOnS3 = `https://${stickerBucket}.s3.${region}.amazonaws.com/${uploadParams.Key}`;
    return imageUrlOnS3;
  } catch (error) {
    throw new Error(`Error uploading image to S3: ${error}`);
  }
}
