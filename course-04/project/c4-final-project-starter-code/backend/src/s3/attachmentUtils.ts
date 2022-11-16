import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('attachmentUtils')
// TODO: Implement the fileStogare logic
export class AttachmentUtils{
    constructor(private readonly s3 = new XAWS.S3({
        signatureVersion: 'v4'
      }), private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
         private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
      )
    {
        logger.info("Created AttachmentUtils object and the S3 object")
    }

    createPresignedUrl(userId: string, todoId: string){
        logger.info("Fetching signed url for user id and todo id: ", userId, todoId)
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: `${userId}-${todoId}`,
            Expires: Number(this.urlExpiration)
          })
    }

    getAttachmentUrl(userId: string, todoId: string){
        logger.info("Constructing and returning attachment url")
       return `https://${this.bucketName}.s3.amazonaws.com/${userId}-${todoId}`
    }
}