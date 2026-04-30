import { render, screen, fireEvent } from "@testing-library/react";
import UploadError from "@/frontend/components/UploadError/UploadError";

describe("UploadError", () => {
  test("displays the error message", () => {
    render(<UploadError error="File too large" onReset={jest.fn()} />);
    expect(screen.getByText("File too large")).toBeInTheDocument();
  });

  test("calls onReset when Try again is clicked", () => {
    const onReset = jest.fn();
    render(<UploadError error="Some error" onReset={onReset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
