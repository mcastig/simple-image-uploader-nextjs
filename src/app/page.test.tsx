"use client";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("@/frontend/components/Header/Header", () => ({
  __esModule: true,
  default: ({ onToggleTheme }: { onToggleTheme: () => void }) => (
    <button data-testid="theme-toggle" onClick={onToggleTheme} />
  ),
}));

jest.mock("@/frontend/components/Dropzone/Dropzone", () => ({
  __esModule: true,
  default: ({
    onDrop,
  }: {
    onDrop: (
      accepted: File[],
      rejected: { errors: { code: string }[] }[],
    ) => void;
  }) => (
    <div data-testid="dropzone">
      <button
        data-testid="drop-valid"
        onClick={() =>
          onDrop([new File(["d"], "f.jpg", { type: "image/jpeg" })], [])
        }
      />
      <button
        data-testid="drop-too-large"
        onClick={() => onDrop([], [{ errors: [{ code: "file-too-large" }] }])}
      />
      <button
        data-testid="drop-invalid-type"
        onClick={() =>
          onDrop([], [{ errors: [{ code: "file-invalid-type" }] }])
        }
      />
      <button
        data-testid="drop-other-error"
        onClick={() => onDrop([], [{ errors: [{ code: "unknown-code" }] }])}
      />
      <button data-testid="drop-empty" onClick={() => onDrop([], [])} />
    </div>
  ),
}));

jest.mock("@/frontend/components/UploadLoader/UploadLoader", () => ({
  __esModule: true,
  default: () => <div data-testid="upload-loader" />,
}));

jest.mock("@/frontend/components/UploadSuccess/UploadSuccess", () => ({
  __esModule: true,
  default: ({
    uploadedUrl,
    uploadedFilename,
    onReset,
  }: {
    uploadedUrl: string;
    uploadedFilename: string;
    onReset: () => void;
  }) => (
    <div>
      <span data-testid="uploaded-url">{uploadedUrl}</span>
      <span data-testid="uploaded-filename">{uploadedFilename}</span>
      <button data-testid="reset-success" onClick={onReset} />
    </div>
  ),
}));

jest.mock("@/frontend/components/UploadError/UploadError", () => ({
  __esModule: true,
  default: ({
    error,
    onReset,
  }: {
    error: string;
    onReset: () => void;
  }) => (
    <div>
      <span data-testid="error-msg">{error}</span>
      <button data-testid="reset-error" onClick={onReset} />
    </div>
  ),
}));

function mockFetch(ok: boolean, body: object) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(body),
  });
}

describe("Home page", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders dropzone in idle state", () => {
    render(<Home />);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  test("shows loader while fetch is in flight and setTimeout is pending", async () => {
    mockFetch(true, { url: "/uploads/x.jpg", filename: "x.jpg" });
    jest.useFakeTimers();
    render(<Home />);

    // Wrap in act so microtasks (fetch resolution) flush before we assert.
    // The component is still "uploading" because setState("success") sits behind
    // a 3-second setTimeout that fake timers haven't advanced yet.
    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });

    expect(screen.getByTestId("upload-loader")).toBeInTheDocument();

    // Clean up pending timers to prevent act() warnings leaking into other tests
    act(() => jest.runAllTimers());
    jest.useRealTimers();
  });

  test("shows success state after 3s on successful upload", async () => {
    mockFetch(true, { url: "/uploads/x.jpg", filename: "x.jpg" });
    jest.useFakeTimers();
    render(<Home />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });

    act(() => jest.advanceTimersByTime(3000));

    expect(screen.getByTestId("uploaded-url")).toHaveTextContent(
      "/uploads/x.jpg",
    );
    expect(screen.getByTestId("uploaded-filename")).toHaveTextContent("x.jpg");
    jest.useRealTimers();
  });

  test("shows error state when server returns error", async () => {
    mockFetch(false, { error: "File too large." });
    render(<Home />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });

    expect(screen.getByTestId("error-msg")).toHaveTextContent("File too large.");
  });

  test("uses Upload failed fallback when server error has no message", async () => {
    mockFetch(false, {});
    render(<Home />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });

    expect(screen.getByTestId("error-msg")).toHaveTextContent("Upload failed");
  });

  test("shows error state when fetch throws a network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network error"));
    render(<Home />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });

    expect(screen.getByTestId("error-msg")).toHaveTextContent(
      "Upload failed. Please try again.",
    );
  });

  test("shows file-too-large error for that rejection code", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("drop-too-large"));
    expect(screen.getByTestId("error-msg")).toHaveTextContent(
      "File is too large. Max size is 2MB.",
    );
  });

  test("shows invalid-type error for that rejection code", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("drop-invalid-type"));
    expect(screen.getByTestId("error-msg")).toHaveTextContent(
      "Invalid type. Only JPG, PNG or GIF allowed.",
    );
  });

  test("shows generic rejection error for other codes", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("drop-other-error"));
    expect(screen.getByTestId("error-msg")).toHaveTextContent(
      "File rejected. Please try again.",
    );
  });

  test("does nothing when drop delivers empty arrays", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("drop-empty"));
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  test("resets from error back to idle", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("err"));
    render(<Home />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });

    fireEvent.click(screen.getByTestId("reset-error"));
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  test("resets from success back to idle", async () => {
    mockFetch(true, { url: "/uploads/x.jpg", filename: "x.jpg" });
    jest.useFakeTimers();
    render(<Home />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("drop-valid"));
    });
    act(() => jest.advanceTimersByTime(3000));

    fireEvent.click(screen.getByTestId("reset-success"));
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
    jest.useRealTimers();
  });

  test("toggles theme on header button click", () => {
    const setAttribute = jest.spyOn(
      document.documentElement,
      "setAttribute",
    );
    render(<Home />);

    fireEvent.click(screen.getByTestId("theme-toggle"));
    expect(setAttribute).toHaveBeenCalledWith("data-theme", "dark");

    fireEvent.click(screen.getByTestId("theme-toggle"));
    expect(setAttribute).toHaveBeenCalledWith("data-theme", "light");

    setAttribute.mockRestore();
  });
});
