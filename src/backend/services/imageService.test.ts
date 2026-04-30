jest.mock("@/backend/lib/fsPromises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

import { saveImage, getImage } from "@/backend/services/imageService";
import * as fsMod from "@/backend/lib/fsPromises";

const fsMock = fsMod as {
  mkdir: jest.MockedFunction<typeof fsMod.mkdir>;
  writeFile: jest.MockedFunction<typeof fsMod.writeFile>;
  readFile: jest.MockedFunction<typeof fsMod.readFile>;
};

describe("saveImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fsMock.mkdir.mockResolvedValue(undefined);
    fsMock.writeFile.mockResolvedValue(undefined);
  });

  test("returns 400 for invalid file type", async () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const result = await saveImage(file);
    expect(result).toEqual({
      ok: false,
      error: "Invalid file type. Only JPG, PNG or GIF allowed.",
      status: 400,
    });
  });

  test("returns 400 when file exceeds 2MB", async () => {
    const bigData = new Uint8Array(2 * 1024 * 1024 + 1);
    const file = new File([bigData], "big.jpg", { type: "image/jpeg" });
    const result = await saveImage(file);
    expect(result).toEqual({
      ok: false,
      error: "File too large. Max size is 2MB.",
      status: 400,
    });
  });

  test("returns 500 when mkdir throws", async () => {
    fsMock.mkdir.mockRejectedValue(new Error("permission denied"));
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const result = await saveImage(file);
    expect(result).toEqual({
      ok: false,
      error: "Failed to save file.",
      status: 500,
    });
  });

  test("returns 500 when writeFile throws", async () => {
    fsMock.writeFile.mockRejectedValue(new Error("disk full"));
    const file = new File(["content"], "test.png", { type: "image/png" });
    const result = await saveImage(file);
    expect(result).toEqual({
      ok: false,
      error: "Failed to save file.",
      status: 500,
    });
  });

  test("saves a jpg file and returns url and filename", async () => {
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const result = await saveImage(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toMatch(/^\/uploads\/.+\.jpg$/);
      expect(result.filename).toMatch(/\.jpg$/);
    }
  });

  test("saves a png file", async () => {
    const file = new File(["img"], "photo.png", { type: "image/png" });
    const result = await saveImage(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toMatch(/\.png$/);
    }
  });

  test("saves a gif file", async () => {
    const file = new File(["img"], "photo.gif", { type: "image/gif" });
    const result = await saveImage(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toMatch(/\.gif$/);
    }
  });
});

describe("getImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 404 when file is not found", async () => {
    fsMock.readFile.mockRejectedValue(
      Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
    );
    const result = await getImage("missing.jpg");
    expect(result).toEqual({ ok: false, error: "Not found.", status: 404 });
  });

  test("returns buffer and image/jpeg content-type for .jpg", async () => {
    const buf = Buffer.from("fake jpeg data");
    fsMock.readFile.mockResolvedValue(buf);
    const result = await getImage("photo.jpg");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.buffer).toBe(buf);
      expect(result.contentType).toBe("image/jpeg");
      expect(result.filename).toBe("photo.jpg");
    }
  });

  test("returns image/jpeg content-type for .jpeg", async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from("data"));
    const result = await getImage("photo.jpeg");
    expect(result.ok && result.contentType).toBe("image/jpeg");
  });

  test("returns image/png content-type for .png", async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from("data"));
    const result = await getImage("photo.png");
    expect(result.ok && result.contentType).toBe("image/png");
  });

  test("returns image/gif content-type for .gif", async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from("data"));
    const result = await getImage("photo.gif");
    expect(result.ok && result.contentType).toBe("image/gif");
  });

  test("returns application/octet-stream for unknown extension", async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from("data"));
    const result = await getImage("file.bin");
    expect(result.ok && result.contentType).toBe("application/octet-stream");
  });

  test("strips path traversal via path.basename", async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from("data"));
    const result = await getImage("../../../etc/passwd");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filename).toBe("passwd");
    }
  });
});
