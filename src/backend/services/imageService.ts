import { writeFile, readFile, mkdir } from "@/backend/lib/fsPromises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

const uploadsDir = () => path.join(process.cwd(), "public", "uploads");

export type SaveImageResult =
  | { ok: true; url: string; filename: string }
  | { ok: false; error: string; status: number };

export async function saveImage(file: File): Promise<SaveImageResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      error: "Invalid file type. Only JPG, PNG or GIF allowed.",
      status: 400,
    };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "File too large. Max size is 2MB.", status: 400 };
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = uploadsDir();

  try {
    await mkdir(dir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(dir, filename), Buffer.from(bytes));
  } catch {
    return { ok: false, error: "Failed to save file.", status: 500 };
  }

  return { ok: true, url: `/uploads/${filename}`, filename };
}

export type GetImageResult =
  | { ok: true; buffer: Buffer; contentType: string; filename: string }
  | { ok: false; error: string; status: number };

export async function getImage(filename: string): Promise<GetImageResult> {
  const safeName = path.basename(filename);
  const filepath = path.join(uploadsDir(), safeName);

  let buffer: Buffer;
  try {
    buffer = await readFile(filepath);
  } catch {
    return { ok: false, error: "Not found.", status: 404 };
  }

  /* c8 ignore next */
  const ext = safeName.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return { ok: true, buffer, contentType, filename: safeName };
}
