import { render, screen } from "@testing-library/react";
import type { FileRejection } from "react-dropzone";
import Dropzone from "@/frontend/components/Dropzone/Dropzone";

let mockIsDragActive = false;
let capturedOnDrop: ((accepted: File[], rejected: FileRejection[]) => void) | undefined;

jest.mock("react-dropzone", () => ({
  useDropzone: (opts: {
    onDrop: (accepted: File[], rejected: FileRejection[]) => void;
  }) => {
    capturedOnDrop = opts.onDrop;
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({ type: "file" }),
      isDragActive: mockIsDragActive,
    };
  },
}));

describe("Dropzone", () => {
  beforeEach(() => {
    mockIsDragActive = false;
    capturedOnDrop = undefined;
  });

  test("renders hint text", () => {
    render(<Dropzone onDrop={jest.fn()} />);
    expect(screen.getByText(/JPG, PNG or GIF/i)).toBeInTheDocument();
  });

  test("renders browse files link text", () => {
    render(<Dropzone onDrop={jest.fn()} />);
    expect(screen.getByText(/browse files/i)).toBeInTheDocument();
  });

  test("does not apply drag-active class by default", () => {
    const { container } = render(<Dropzone onDrop={jest.fn()} />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /dragActive/,
    );
  });

  test("applies drag-active class when dragging", () => {
    mockIsDragActive = true;
    const { container } = render(<Dropzone onDrop={jest.fn()} />);
    expect((container.firstChild as HTMLElement).className).toMatch(/dragActive/);
  });

  test("passes onDrop handler through to useDropzone", () => {
    const onDrop = jest.fn();
    render(<Dropzone onDrop={onDrop} />);
    expect(capturedOnDrop).toBe(onDrop);
  });
});
