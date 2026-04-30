import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/frontend/components/Header/Header";

describe("Header", () => {
  test("renders the logo text", () => {
    render(<Header theme="light" onToggleTheme={jest.fn()} />);
    expect(screen.getByText("ImageUpload")).toBeInTheDocument();
  });

  test("shows moon icon when theme is light", () => {
    render(<Header theme="light" onToggleTheme={jest.fn()} />);
    expect(screen.getByAltText("Switch to dark mode")).toBeInTheDocument();
  });

  test("shows sun icon when theme is dark", () => {
    render(<Header theme="dark" onToggleTheme={jest.fn()} />);
    expect(screen.getByAltText("Switch to light mode")).toBeInTheDocument();
  });

  test("calls onToggleTheme when the theme button is clicked", () => {
    const onToggleTheme = jest.fn();
    render(<Header theme="light" onToggleTheme={onToggleTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
