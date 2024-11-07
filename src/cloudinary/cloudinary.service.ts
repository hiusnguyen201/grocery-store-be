import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  async uploadImageBuffer(
    fileBuffer: Buffer,
    folder: string,
    fileName: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);

      // Use upload_stream to upload the Readable stream
      readableStream.pipe(
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder,
            public_id: fileName,
          },
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          },
        ),
      );
    });
  }

  async uploadFile(
    filePath: string,
    folder: string,
    fileName: string,
  ): Promise<UploadApiResponse> {
    return await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: fileName,
      resource_type: 'raw',
    });
  }
}
