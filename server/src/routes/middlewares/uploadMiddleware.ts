import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import config from '../../config';

const s3Client = new S3Client(config.AWS_CONFIG);

export const uploadMiddleware = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.RAW_BUCKET,
    contentDisposition: 'inline',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
        const fileName = file.originalname;
        cb(null, 'videos/' + fileName);
    },
  }),
});
