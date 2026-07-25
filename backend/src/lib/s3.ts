import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomBytes } from "node:crypto";

const REGION = process.env.AWS_REGION || "";
const BUCKET = process.env.S3_BUCKET || "";

/** True only when region, bucket and credentials are all configured. */
export const storageConfigured = Boolean(
  REGION && BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

// Credentials are picked up from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
const client = storageConfigured ? new S3Client({ region: REGION }) : null;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Upload an image buffer to S3 and return its public URL. */
export async function uploadImage(
  file: {
    buffer: Buffer;
    mimetype: string;
  },
  folder: string = "products"
): Promise<string> {
  if (!client) {
    throw Object.assign(
      new Error("Image uploads are not configured. Set AWS_* and S3_BUCKET in backend/.env."),
      { status: 503 }
    );
  }
  const ext = EXT[file.mimetype] ?? "bin";
  const name = `${folder}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: name,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${name}`;
}
