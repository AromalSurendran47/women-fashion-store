import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { randomBytes } from "node:crypto";

const ACCOUNT = process.env.AZURE_STORAGE_NAME || "";
const KEY = process.env.AZURE_STORAGE_KEY || "";
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER || "";

/** True only when account + key + container are all configured. */
export const blobConfigured = Boolean(ACCOUNT && KEY && CONTAINER);

const containerClient = blobConfigured
  ? new BlobServiceClient(
      `https://${ACCOUNT}.blob.core.windows.net`,
      new StorageSharedKeyCredential(ACCOUNT, KEY)
    ).getContainerClient(CONTAINER)
  : null;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Upload an image buffer to Azure Blob Storage and return its public URL. */
export async function uploadImageToBlob(file: {
  buffer: Buffer;
  mimetype: string;
}): Promise<string> {
  if (!containerClient) {
    throw Object.assign(
      new Error("Image uploads are not configured. Set AZURE_STORAGE_* in backend/.env."),
      { status: 503 }
    );
  }
  const ext = EXT[file.mimetype] ?? "bin";
  const name = `products/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const block = containerClient.getBlockBlobClient(name);
  await block.upload(file.buffer, file.buffer.length, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });
  return block.url;
}
