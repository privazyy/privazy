import "server-only";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let r2Client: S3Client | null = null;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getR2Client() {
  if (!r2Client) {
    const accountId = requiredEnv("CLOUDFLARE_ACCOUNT_ID");

    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
      },
    });
  }

  return r2Client;
}

export function getR2Bucket() {
  return requiredEnv("CLOUDFLARE_R2_BUCKET");
}

export async function uploadPrivateObject(input: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
}) {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return { key: input.key };
}

export async function downloadPrivateObject(key: string) {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`R2 object is empty: ${key}`);
  }

  return Buffer.from(await response.Body.transformToByteArray());
}

export async function createPrivateDownloadUrl(key: string, expiresInSeconds = 300) {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
    }),
    { expiresIn: expiresInSeconds },
  );
}
