import axios from 'axios';
import sharp from 'sharp';
import AWS from 'aws-sdk';

const stickerBucket = 'whatsappstickers';
const region = 'eu-west-1';
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_KEY_SECRET,
  region 
});

const convertImageToWebp = async (imageUrl) => {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const webpBuffer = await sharp(imageBuffer).webp().toBuffer();
    return webpBuffer
}

export const uploadImageToS3 = async (imageUrl) => {
  try {
    const buffer = await convertImageToWebp(imageUrl);
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
