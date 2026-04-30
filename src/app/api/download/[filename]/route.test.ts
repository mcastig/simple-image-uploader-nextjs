import { GET } from "@/app/api/download/[filename]/route";

jest.mock("@/backend/services/imageService", () => ({
  getImage: jest.fn(),
}));

import { getImage } from "@/backend/services/imageService";
const mockedGetImage = jest.mocked(getImage);

describe("GET /api/download/[filename]", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 404 JSON when image is not found", async () => {
    mockedGetImage.mockResolvedValue({
      ok: false,
      error: "Not found.",
      status: 404,
    });
    const res = await GET({} as Request, {
      params: Promise.resolve({ filename: "missing.jpg" }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found." });
  });

  test("returns file bytes with Content-Type and Content-Disposition headers", async () => {
    const buf = Buffer.from("fake image bytes");
    mockedGetImage.mockResolvedValue({
      ok: true,
      buffer: buf,
      contentType: "image/jpeg",
      filename: "photo.jpg",
    });
    const res = await GET({} as Request, {
      params: Promise.resolve({ filename: "photo.jpg" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="photo.jpg"',
    );
    const body = await res.arrayBuffer();
    expect(new Uint8Array(body)).toEqual(new Uint8Array(buf));
  });
});
