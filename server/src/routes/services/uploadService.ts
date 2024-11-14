import { Request, Response } from 'express';
import { pollMessagesAndTranscode } from '../helper';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../../config';

const s3Client = new S3Client(config.AWS_CONFIG);

export const uploadVideoService = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
    }

    const file = req.file as Express.MulterS3.File;
    
    // poll for messages
    await pollMessagesAndTranscode();
    
    res.status(200).send({
        message: 'File uploaded successfully',
        access_link: file,
    });
};

export const getUploadedVideosService = async (req: Request, res: Response) => {
    const { name } = req.query;
    const originalname = typeof name === 'string' ? name.split('.')[0] : undefined;
    if (!originalname) {
        res.status(400).send('No file name provided');
    };

    const formats = ['360p', '480p', '720p'];
    try {
        const promises = formats.map(async (format) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const command = new GetObjectCommand({
                        Bucket: config.TRANSCODED_VIDEO_BUCKET,
                        Key: `videos/${originalname}-${format}.mp4`,
                    });
                    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                    resolve({
                        format,
                        url,
                    });
                } catch (error: any) {
                    console.log(error.message, 'Error in getting the signed URL');
                    reject(error);
                }
            });
        });

        const urls = await Promise.all(promises);
        res.status(200).send({
            message: 'Videos fetched successfully',
            urls: urls,
        });
    } catch (error: any) {
        console.log(error.message, 'Error in getting the uploaded videos');
    }
};
