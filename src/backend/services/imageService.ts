import { put, list } from "@vercel/blob";
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

  try {
    const blob = await put(filename, file, { access: "public" });
    return { ok: true, url: blob.url, filename };
  } catch {
    return { ok: false, error: "Failed to save file.", status: 500 };
  }
}

export type GetImageResult =
  | { ok: true; buffer: Buffer; contentType: string; filename: string }
  | { ok: false; error: string; status: number };

export async function getImage(filename: string): Promise<GetImageResult> {
  const safeName = path.basename(filename);

  try {
    const { blobs } = await list({ prefix: safeName, limit: 1 });
    if (!blobs.length) {
      return { ok: false, error: "Not found.", status: 404 };
    }

    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return { ok: false, error: "Not found.", status: 404 };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    /* c8 ignore next */
    const ext = safeName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return { ok: true, buffer, contentType, filename: safeName };
  } catch {
    return { ok: false, error: "Not found.", status: 404 };
  }
}
