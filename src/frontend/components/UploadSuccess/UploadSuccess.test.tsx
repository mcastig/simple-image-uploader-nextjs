import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import UploadSuccess from "@/frontend/components/UploadSuccess/UploadSuccess";

const defaultProps = {
  uploadedUrl: "/uploads/test.jpg",
  uploadedFilename: "test.jpg",
  onReset: jest.fn(),
};

// Ensure document.execCommand exists for jsdom environments where it may be
// undefined (jsdom 20+ removed the stub).
function ensureExecCommand() {
  if (typeof document.execCommand !== "function") {
    Object.defineProperty(document, "execCommand", {
      value: jest.fn(),
      configurable: true,
      writable: true,
    });
  }
}

describe("UploadSuccess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureExecCommand();
  });

  test("renders the uploaded image preview", () => {
    render(<UploadSuccess {...defaultProps} />);
    const img = screen.getByAltText("Uploaded") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("/uploads/test.jpg");
  });

  test("renders Share and Download buttons", () => {
    render(<UploadSuccess {...defaultProps} />);
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  test("renders Upload another image button", () => {
    render(<UploadSuccess {...defaultProps} />);
    expect(screen.getByText("Upload another image")).toBeInTheDocument();
  });

  test("calls onReset when Upload another image is clicked", () => {
    const onReset = jest.fn();
    render(<UploadSuccess {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByText("Upload another image"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  test("copies URL via navigator.clipboard and shows Copied! briefly", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    jest.useFakeTimers();
    render(<UploadSuccess {...defaultProps} />);

    fireEvent.click(screen.getByText("Share"));

    await waitFor(() =>
      expect(screen.getByText("Copied!")).toBeInTheDocument(),
    );
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/uploads/test.jpg`,
    );

    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText("Share")).toBeInTheDocument();

    jest.useRealTimers();
  });

  test("falls back to execCommand when clipboard.writeText throws", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: jest.fn().mockRejectedValue(new Error("denied")),
      },
      configurable: true,
      writable: true,
    });
    const execCommandSpy = jest
      .spyOn(document, "execCommand")
      .mockReturnValue(true);

    jest.useFakeTimers();
    render(<UploadSuccess {...defaultProps} />);

    fireEvent.click(screen.getByText("Share"));

    await waitFor(() =>
      expect(screen.getByText("Copied!")).toBeInTheDocument(),
    );
    expect(execCommandSpy).toHaveBeenCalledWith("copy");

    execCommandSpy.mockRestore();
    jest.useRealTimers();
  });

  test("creates and clicks a download anchor with correct attributes", () => {
    render(<UploadSuccess {...defaultProps} />);

    const origCreate = document.createElement.bind(document);
    let capturedAnchor: HTMLAnchorElement | null = null;
    const createSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        const el = origCreate(tag);
        if (tag === "a") {
          capturedAnchor = el as HTMLAnchorElement;
          jest.spyOn(capturedAnchor, "click").mockImplementation(jest.fn());
        }
        return el;
      });

    fireEvent.click(screen.getByText("Download"));

    expect(capturedAnchor).not.toBeNull();
    expect(
      (capturedAnchor as unknown as HTMLAnchorElement).href,
    ).toContain("/api/download/test.jpg");
    expect(
      (capturedAnchor as unknown as HTMLAnchorElement).download,
    ).toBe("test.jpg");
    expect(
      (capturedAnchor as unknown as HTMLAnchorElement).click,
    ).toHaveBeenCalled();

    createSpy.mockRestore();
  });
});
