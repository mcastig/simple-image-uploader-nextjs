import { render } from "@testing-library/react";
import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  test("renders children inside the layout", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { getByText } = render(
      <RootLayout>
        <p>hello world</p>
      </RootLayout>,
    );
    expect(getByText("hello world")).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
