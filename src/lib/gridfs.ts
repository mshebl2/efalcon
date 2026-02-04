import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import clientPromise from './mongodb';

export interface GridFSFile {
  _id: ObjectId;
  filename: string;
  contentType?: string; // Optional - may not be set for all files
  length: number;
  chunkSize: number;
  uploadDate: Date;
  metadata?: {
    title?: string;
    description?: string;
    order?: number;
    isActive?: boolean;
    page?: string;
  };
}

export class GridFSUtils {
  private static bucket: GridFSBucket | null = null;

  private static async getBucket(): Promise<GridFSBucket> {
    if (!this.bucket) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'petrowebsite');
      this.bucket = new GridFSBucket(db, { bucketName: 'images' });
    }
    return this.bucket;
  }

  // Upload file to GridFS
  static async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
    metadata?: GridFSFile['metadata']
  ): Promise<string> {
    const bucket = await this.getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType, // Store content type properly!
      metadata: metadata || {}
    });

    return new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });
      uploadStream.end(buffer);
    });
  }

  // Download file from GridFS
  static async downloadFile(fileId: string): Promise<Buffer> {
    const bucket = await this.getBucket();
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('error', reject);
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  // Get file info
  static async getFileInfo(fileId: string): Promise<GridFSFile | null> {
    const bucket = await this.getBucket();
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    return files[0] || null;
  }

  // List files with metadata
  static async listFiles(filter: any = {}): Promise<GridFSFile[]> {
    const bucket = await this.getBucket();
    return await bucket.find(filter).toArray();
  }

  // Delete file
  static async deleteFile(fileId: string): Promise<boolean> {
    const bucket = await this.getBucket();
    try {
      await bucket.delete(new ObjectId(fileId));
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file stream for serving
  static async getFileStream(fileId: string) {
    const bucket = await this.getBucket();
    return bucket.openDownloadStream(new ObjectId(fileId));
  }

  // Check if file exists
  static async fileExists(fileId: string): Promise<boolean> {
    const bucket = await this.getBucket();
    const files = await bucket.find({ _id: new ObjectId(fileId) }).limit(1).toArray();
    return files.length > 0;
  }
}
