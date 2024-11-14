**Video Transcoding Service Typescript Project**


This project leverages use of 
1. React.js for Frontend
2. Express.js for Backend
3. AWS SQS, ECS and S3 buckets
4. Docker Containerization

User can upload a video file, and can get the video in 3 transcoded formats: [360P, 480P, 720P].

-----------------------------------------------------------------------------------------------

**Architecture**: User uploaded video is uplodead to a temporary raw S3 bucket
1. This raw bucket pushes a message to SQS on upload
2. Server will poll for messages and upon recieving one, it spins a docker container
3. Docket Container downloads the raw video from temporary S3 Bucket, and transcodes it to 3 formats using FFMPEG.
4. Transcoded videos are pushed to Transcoded-Video S3 Bucket
5. User can hit an express endpoint to fetch the Presigned URLs of the transcoded videos and download them.

-----------------------------------------------------------------------------------------------

**Technologies** used:
1. ReactJS for FE
2. ExpressJS for BE
3. MulterS3 for file upload using multer to S3
4. AWS ECS for spinning up docker container task
5. AWS SQS for polling for the messages
6. S3 Request Presigner for getting presigned urls for the user to download the vidoes
7. S3 Buckets
8. and finally Typescript for writing stable and scalable code :)


**Setup**
1. Simply replace **config-example.ts** file in server with **config.ts** and fill in the values.
2. FE -> Start Command -> npm start
3. BE -> **.vscode** can be used for debugging purposed
4. Don't forget to do install the packages :)