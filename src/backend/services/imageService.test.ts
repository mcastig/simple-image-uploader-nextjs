jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
  list: jest.fn(),
}));

import { saveImage, getImage } from "@/backend/services/imageService";
import { put, list } from "@vercel/blob";

const mockedPut = jest.mocked(put);
const mockedList = jest.mocked(list);

describe("saveImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  test("returns 500 when put throws", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedPut.mockRejectedValue(new Error("Blob error"));
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const result = await saveImage(file);
    expect(result).toEqual({
      ok: false,
      error: "Failed to save file.",
      status: 500,
    });
    expect(consoleError).toHaveBeenCalledWith(
      "[saveImage] put failed:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });

  test("saves a jpg file and returns blob url and filename", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/photo.jpg";
    mockedPut.mockResolvedValue({ url: blobUrl } as ReturnType<typeof put> extends Promise<infer T> ? T : never);
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const result = await saveImage(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toBe(blobUrl);
      expect(result.filename).toMatch(/\.jpg$/);
    }
  });

  test("saves a png file", async () => {
    mockedPut.mockResolvedValue({
      url: "https://example.blob.vercel-storage.com/photo.png",
    } as ReturnType<typeof put> extends Promise<infer T> ? T : never);
    const file = new File(["img"], "photo.png", { type: "image/png" });
    const result = await saveImage(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toMatch(/\.png$/);
    }
  });

  test("saves a gif file", async () => {
    mockedPut.mockResolvedValue({
      url: "https://example.blob.vercel-storage.com/photo.gif",
    } as ReturnType<typeof put> extends Promise<infer T> ? T : never);
    const file = new File(["img"], "photo.gif", { type: "image/gif" });
    const result = await saveImage(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toMatch(/\.gif$/);
    }
  });
});

describe("getImage", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test("returns 404 when no blobs match filename", async () => {
    mockedList.mockResolvedValue({ blobs: [] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    const result = await getImage("missing.jpg");
    expect(result).toEqual({ ok: false, error: "Not found.", status: 404 });
  });

  test("returns 404 when fetch response is not ok", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/photo.jpg";
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({ ok: false } as Response);
    const result = await getImage("photo.jpg");
    expect(result).toEqual({ ok: false, error: "Not found.", status: 404 });
  });

  test("returns 404 when list throws", async () => {
    mockedList.mockRejectedValue(new Error("Blob error"));
    const result = await getImage("photo.jpg");
    expect(result).toEqual({ ok: false, error: "Not found.", status: 404 });
  });

  test("returns buffer and image/jpeg content-type for .jpg", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/photo.jpg";
    const arrayBuffer = new ArrayBuffer(8);
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
    } as unknown as Response);
    const result = await getImage("photo.jpg");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.contentType).toBe("image/jpeg");
      expect(result.filename).toBe("photo.jpg");
    }
  });

  test("returns image/jpeg content-type for .jpeg", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/photo.jpeg";
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);
    const result = await getImage("photo.jpeg");
    expect(result.ok && result.contentType).toBe("image/jpeg");
  });

  test("returns image/png content-type for .png", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/photo.png";
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);
    const result = await getImage("photo.png");
    expect(result.ok && result.contentType).toBe("image/png");
  });

  test("returns image/gif content-type for .gif", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/photo.gif";
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);
    const result = await getImage("photo.gif");
    expect(result.ok && result.contentType).toBe("image/gif");
  });

  test("returns application/octet-stream for unknown extension", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/file.bin";
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);
    const result = await getImage("file.bin");
    expect(result.ok && result.contentType).toBe("application/octet-stream");
  });

  test("strips path traversal via path.basename", async () => {
    const blobUrl = "https://example.blob.vercel-storage.com/passwd";
    mockedList.mockResolvedValue({ blobs: [{ url: blobUrl }] } as unknown as ReturnType<typeof list> extends Promise<infer T> ? T : never);
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as Response);
    const result = await getImage("../../../etc/passwd");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.filename).toBe("passwd");
    }
  });
});
