import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

type UploadFile = {
  folder: string;
  fileName: string;
  resourceType: 'image' | 'video' | 'raw' | 'auto';
};

export type UploadBufferFile = UploadFile & { file: Buffer };
export type UploadPathFile = UploadFile & { filePath: string };

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectQueue(CloudinaryService.name) private readonly uploadQueue: Queue,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  async uploadBuffer(
    jobName: string,
    upload: UploadBufferFile,
  ): Promise<UploadApiResponse> {
    const job = await this.uploadQueue.add(jobName, upload);
    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(upload.file);
      readableStream.push(null);

      // Use upload_stream to upload the Readable stream
      readableStream.pipe(
        cloudinary.uploader.upload_stream(
          {
            resource_type: upload.resourceType,
            folder: upload.folder,
            public_id: upload.fileName,
          },
          async (err, result) => {
            if (err) {
              reject(err);
            } else {
              await job.remove();
              resolve(result);
            }
          },
        ),
      );
    });
  }

  async uploadFile(
    jobName: string,
    upload: UploadPathFile,
  ): Promise<UploadApiResponse> {
    const job = await this.uploadQueue.add(jobName, upload);
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload(upload.filePath, {
          folder: upload.folder,
          public_id: upload.fileName,
          resource_type: upload.resourceType,
        })
        .then(async (result) => {
          await job.remove();
          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }
}
