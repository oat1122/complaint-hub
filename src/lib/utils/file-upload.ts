import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export const UPLOAD_DIR = path.resolve(process.cwd(), "public/uploads");
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function saveFile(file: File): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
}> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalName = file.name;
  const mimeType = file.type;

  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    throw new Error("File type not allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds limit");
  }

  const uniqueFileName = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFileName);
  const relativeFilePath = `/uploads/${uniqueFileName}`;

  // Optimize images before saving
  if (mimeType.startsWith("image/")) {
    const optimizedImage = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
    await writeFile(filePath, optimizedImage);
  } else {
    await writeFile(filePath, buffer);
  }

  return {
    fileName: uniqueFileName,
    filePath: relativeFilePath,
    fileSize: file.size,
    mimeType,
    originalName,
  };
}
