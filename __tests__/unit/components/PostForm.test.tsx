import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, jest, beforeEach } from "@jest/globals";
import PostForm from "@/app/components/PostForm";

// Mock the fetch function
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("PostForm Component", () => {
  beforeEach(() => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  it("should render the form with all fields", () => {
    const mockSuccess = jest.fn();

    render(<PostForm onSuccess={mockSuccess} />);

    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/content/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post/i })).toBeInTheDocument();
  });

  it("should update input values when typed", () => {
    const mockSuccess = jest.fn();

    render(<PostForm onSuccess={mockSuccess} />);

    const titleInput = screen.getByPlaceholderText(
      /title/i,
    ) as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      /content/i,
    ) as HTMLTextAreaElement;

    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(contentInput, { target: { value: "Test Content" } });

    expect(titleInput.value).toBe("Test Title");
    expect(contentInput.value).toBe("Test Content");
  });

  it("should submit form and call onSuccess on success", async () => {
    const mockSuccess = jest.fn();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    render(<PostForm onSuccess={mockSuccess} />);

    const titleInput = screen.getByPlaceholderText(/title/i);
    const contentInput = screen.getByPlaceholderText(/content/i);
    const submitButton = screen.getByRole("button", { name: /post/i });

    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(contentInput, { target: { value: "Test Content" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/posts"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test Title",
            content: "Test Content",
          }),
        }),
      );
      expect(mockSuccess).toHaveBeenCalled();
    });
  });

  it("should clear form after successful submission", async () => {
    const mockSuccess = jest.fn();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    render(<PostForm onSuccess={mockSuccess} />);

    const titleInput = screen.getByPlaceholderText(
      /title/i,
    ) as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      /content/i,
    ) as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /post/i });

    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(contentInput, { target: { value: "Test Content" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(titleInput.value).toBe("");
      expect(contentInput.value).toBe("");
    });
  });

  it("should not submit if fields are empty", async () => {
    const mockSuccess = jest.fn();

    render(<PostForm onSuccess={mockSuccess} />);

    const submitButton = screen.getByRole("button", { name: /post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });
});
