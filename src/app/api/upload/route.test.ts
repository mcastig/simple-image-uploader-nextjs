import { POST } from "@/app/api/upload/route";

jest.mock("@/backend/services/imageService", () => ({
  saveImage: jest.fn(),
}));

import { saveImage } from "@/backend/services/imageService";
const mockedSaveImage = jest.mocked(saveImage);

describe("POST /api/upload", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when formData cannot be parsed", async () => {
    const request = {
      formData: jest.fn().mockRejectedValue(new Error("bad body")),
    } as unknown as Request;
    const res = await POST(request);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid request" });
  });

  test("returns 400 when formData has no file field", async () => {
    const request = {
      formData: jest.fn().mockResolvedValue(new FormData()),
    } as unknown as Request;
    const res = await POST(request);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "No file provided" });
  });

  test("returns 400 when file field is a plain string, not a File", async () => {
    const fd = new FormData();
    fd.append("file", "not-a-file");
    const request = {
      formData: jest.fn().mockResolvedValue(fd),
    } as unknown as Request;
    const res = await POST(request);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "No file provided" });
  });

  test("forwards error status from saveImage", async () => {
    mockedSaveImage.mockResolvedValue({
      ok: false,
      error: "File too large. Max size is 2MB.",
      status: 400,
    });
    const fd = new FormData();
    fd.append("file", new File(["data"], "test.jpg", { type: "image/jpeg" }));
    const request = {
      formData: jest.fn().mockResolvedValue(fd),
    } as unknown as Request;
    const res = await POST(request);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "File too large. Max size is 2MB.",
    });
  });

  test("returns 200 with url and filename on success", async () => {
    mockedSaveImage.mockResolvedValue({
      ok: true,
      url: "/uploads/abc123.jpg",
      filename: "abc123.jpg",
    });
    const fd = new FormData();
    fd.append("file", new File(["data"], "test.jpg", { type: "image/jpeg" }));
    const request = {
      formData: jest.fn().mockResolvedValue(fd),
    } as unknown as Request;
    const res = await POST(request);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: "/uploads/abc123.jpg",
      filename: "abc123.jpg",
    });
  });
});
