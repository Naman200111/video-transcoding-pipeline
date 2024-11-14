Video Transcoding Service Typescript Project

This project leverages use of 
   --- React.js for Frontend
   --- Express.js for Backend
   --- AWS SQS, ECS and S3 buckets
   --- Docker Containerization

User can upload a video file, and can get the video in 3 transcoded formats: [360P, 480P, 720P].

Architecture:
  -- User uploaded video is uplodead to a temporary raw S3 bucket
  -- This raw bucket pushes a message to SQS on upload
  -- Server will poll for messages and upon recieving one, it spins a docker container
  -- Docket Container downloads the raw video from temporary S3 Bucket, and transcodes it to 3 formats using FFMPEG.
  -- Transcoded videos are pushed to Transcoded-Video S3 Bucket
  -- User can hit an express endpoint to fetch the Presigned URLs of the transcoded videos and download them.

Technologies used:
  -- ReactJS for FE
  -- ExpressJS for BE
  -- MulterS3 for file upload using multer to S3
  -- AWS ECS for spinning up docker container task
  -- AWS SQS for polling for the messages
  -- S3 Request Presigner for getting presigned urls for the user to download the vidoes
  -- S3 Buckets
  -- and finally Typescript for writing stable and scalable code :)
