const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const ffmpeg = require('fluent-ffmpeg');
// const ffmpegStatic = require('ffmpeg-static'); // added for local testing, added this in docker installation
const fsPromises = require('node:fs/promises');
const fs = require('fs');
const path = require('path');

// ffmpeg.setFfmpegPath(ffmpegStatic); // added for local testing, added this in docker installation

const s3Client = new S3Client({
    region: '',
    credentials: {
      accessKeyId: '',
      secretAccessKey: '',
    },
});

const BUCKET = process.env.BUCKET;
const KEY = process.env.KEY;
const FILENAME = process.env.FILENAME;

const transcodingFormats = [
    {
        format: '360p',
        width: 480,
        height: 360,
    },
    {
        format: '480p',
        width: 854,
        height: 480,
    },
    {
        format: '720p',
        width: 1280,
        height: 720,
    },
];

const transcodeVideo = async () => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: KEY,
        });
    
        const response = await s3Client.send(command);
        const writeFilePath = path.join(__dirname, 'write-stream');
        
        await fsPromises.writeFile(writeFilePath, response.Body);

        const promises = transcodingFormats.map((format) => {
            return new Promise((resolve, reject) => {
                // creating a new readable stream everytime, because a stream can be read only once
                const readableStream = fs.createReadStream(writeFilePath);
                ffmpeg(readableStream)
                    .size(`${format.width}x${format.height}`)
                    .output(`${FILENAME}-${format.format}.mp4`)
                    .format('mp4')
                    .on('progress', (progress) => {
                        console.log(`Processing: ${progress.frames}% done`);
                    })
                    .on('end', async () => {
                        const putCommand = new PutObjectCommand({
                            Bucket: 'videos-transcoding-bucket',
                            Key: `videos/${FILENAME}-${format.format}.mp4`,
                            Body: Buffer.from(fs.readFileSync(`${FILENAME}-${format.format}.mp4`)),
                        });
                        await s3Client.send(putCommand);
                        console.log(`${format.format}.mp4 transcoded`);
                        await fs.unlinkSync(`${FILENAME}-${format.format}.mp4`);
                        resolve();
                    })
                    .on('error', (error) => {
                        reject();
                        console.log(error, 'error');
                    })
                    .run();
            });
        });

        await Promise.all(promises);
        fs.unlinkSync(writeFilePath);
        
        // Delete the raw video file
        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: KEY,
        });
        await s3Client.send(deleteCommand);

    } catch (error) {
        console.log(error, 'error');
    };
}

transcodeVideo();
