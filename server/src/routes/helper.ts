type containerProps = {
    BUCKET: string;
    KEY: string;
    FILENAME: string;
};

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import type { S3Event } from 'aws-lambda';
import config from '../config';

const sqsClient = new SQSClient(config.AWS_CONFIG);
const ecsClient = new ECSClient(config.AWS_CONFIG);

const { ECS_CLUSTER, SUBNETS, SECURITY_GROUPS, TRANSCODING_IMAGE, TASK_DEFINITION, SQS_URL } = config;

const spinTheContainer = async ({BUCKET, KEY, FILENAME}: containerProps) => {
    try {
        const runTaskCommand = new RunTaskCommand({
            cluster: ECS_CLUSTER,
            count: 1,
            launchType: 'FARGATE',
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: SUBNETS,
                    securityGroups: SECURITY_GROUPS,
                    assignPublicIp: 'ENABLED',
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: TRANSCODING_IMAGE,
                        environment: [
                            {
                                name: 'BUCKET',
                                value: BUCKET,
                            },
                            {
                                name: 'KEY',
                                value: KEY,
                            },
                            {
                                name: 'FILENAME',
                                value: FILENAME,
                            },
                        ],
                    },
                ],
            },
            taskDefinition: TASK_DEFINITION,
        });

        await ecsClient.send(runTaskCommand);
        console.log('Container spun up successfully');
    } catch (error: any) {
        console.log(error.message, 'Error in spinning up the container');
    }
};


export const pollMessagesAndTranscode = async () => {
    const command = new ReceiveMessageCommand({
        QueueUrl: SQS_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 10,
    });

    while(true) {
        const { Messages } = await sqsClient.send(command);
        if (!Messages) {
            console.log('No messages received');
            continue;
        }

        try {
            for (const message of Messages) {
                const { Body } = message;

                // validate if it is an S3Event only
                if (!Body) continue;

                const messageBody = JSON.parse(Body) as S3Event;
                const records = messageBody.Records;

                for (const record of records) {
                    const { s3 } = record;
                    if (!s3) continue;
                    
                    const { bucket, object } = s3;
                    if (!bucket || !object) continue;
                    
                    const BUCKET = bucket.name;
                    const KEY = object.key;
                    const FILENAME_WITH_EXT = KEY.split('/')[1] || 'file-name';
                    const FILENAME = FILENAME_WITH_EXT.split('.')[0];
                    
                    if (!BUCKET || !KEY) continue;

                    console.log(record, 'Record');

                    await spinTheContainer({BUCKET, KEY, FILENAME});
                    console.log('Container Spin Process Complete');

                    // delete the message from the queue
                    const deleteMessageCommand = new DeleteMessageCommand({
                        QueueUrl: SQS_URL,
                        ReceiptHandle: message.ReceiptHandle,
                    });
                    await sqsClient.send(deleteMessageCommand);
                    console.log('Message deleted from the queue');
                }
            }
        } catch (error: any) {
            console.log(error.message, 'Error in processing the message');
        }
    }
};