import { render } from "@testing-library/react";
import UploadLoader from "@/frontend/components/UploadLoader/UploadLoader";

describe("UploadLoader", () => {
  test("renders uploading message", () => {
    const { container } = render(<UploadLoader />);
    expect(container.textContent).toMatch(/Uploading/);
    expect(container.textContent).toMatch(/please wait/);
  });

  test("renders progress track element", () => {
    const { container } = render(<UploadLoader />);
    expect(container.querySelectorAll("div").length).toBeGreaterThan(1);
  });
});
