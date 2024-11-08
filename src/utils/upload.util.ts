import { FileInterceptor } from '@nestjs/platform-express';

export const MAX_UPLOAD_FILE_SIZE = 1024 * 1024;

export const allowImageMimeTypes = [
  'image/apng', // Animated Portable Network Graphics (APNG)
  'image/avif', // AV1 Image File Format (AVIF)
  'image/gif', // Graphics Interchange Format (GIF)
  'image/jpeg', // Joint Photographic Expert Group image (JPEG)
  'image/png', // Portable Network Graphics (PNG)
  'image/svg+xml', // Scalable Vector Graphics (SVG)
  'image/webp', // Web Picture format (WEBP)
];

export const imageFileFilter = (
  req: Request,
  file: any,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (allowImageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const configUploadImage = (field: string) =>
  FileInterceptor(field, {
    limits: {
      fileSize: MAX_UPLOAD_FILE_SIZE,
    },
    fileFilter: imageFileFilter,
  });
