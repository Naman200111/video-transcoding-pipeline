const config = {
    AWS_CONFIG: {
      region: '',
      credentials: {
        accessKeyId: '',
        secretAccessKey: '',
      },
    },
    RAW_BUCKET: '',
    TRANSCODED_VIDEO_BUCKET: '',
    ECS_CLUSTER: '',
    SUBNETS: [],
    SECURITY_GROUPS: [],
    TRANSCODING_IMAGE: '',
    TASK_DEFINITION: '',
    SQS_URL: '',
  };
  
  export default config;