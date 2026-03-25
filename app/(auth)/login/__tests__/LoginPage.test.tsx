import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt, ...props }: { src: string, alt?: string }) => <img src={src} alt={alt || ""} {...props} />,
}));

const mockLoginUser = jest.fn();
jest.mock("@/providers/AuthProvider", () => ({
    useAuth: () => ({
        loginUser: mockLoginUser,
        isAuthenticated: false,
        loading: false,
    }),
}));

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the login form", () => {
        render(<LoginPage />);
        expect(screen.getByText("Welcome back!")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
        expect(screen.getByText("LOGIN")).toBeInTheDocument();
    });

    it("shows validation error for empty email on blur", () => {
        render(<LoginPage />);
        const emailInput = screen.getByPlaceholderText("Enter your Email");
        fireEvent.blur(emailInput);
        // After blur, submitting should show the error
        const submitButton = screen.getByText("LOGIN");
        fireEvent.click(submitButton);
        expect(screen.getByText("Email address is required")).toBeInTheDocument();
    });

    it("shows validation error for empty password on submit", () => {
        render(<LoginPage />);
        const emailInput = screen.getByPlaceholderText("Enter your Email");
        fireEvent.change(emailInput, { target: { value: "user@test.com" } });

        const submitButton = screen.getByText("LOGIN");
        fireEvent.click(submitButton);

        expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    it("shows invalid email error on submit", () => {
        render(<LoginPage />);
        const emailInput = screen.getByPlaceholderText("Enter your Email");
        const passwordInput = screen.getByPlaceholderText("Enter Password");
        fireEvent.change(emailInput, { target: { value: "not-email" } });
        fireEvent.change(passwordInput, { target: { value: "password" } });

        const form = screen.getByText("LOGIN").closest("form")!;
        fireEvent.submit(form);

        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });

    it("calls loginUser on valid submit", async () => {
        mockLoginUser.mockResolvedValue(null);
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText("Enter your Email");
        const passwordInput = screen.getByPlaceholderText("Enter Password");

        fireEvent.change(emailInput, { target: { value: "user@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "password" } });

        const form = screen.getByText("LOGIN").closest("form")!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockLoginUser).toHaveBeenCalledWith("user@test.com", "password");
        });
    });

    it("shows error message on failed login", async () => {
        mockLoginUser.mockResolvedValue("Wrong credentials");
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText("Enter your Email");
        const passwordInput = screen.getByPlaceholderText("Enter Password");

        fireEvent.change(emailInput, { target: { value: "user@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

        const form = screen.getByText("LOGIN").closest("form")!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText("Wrong credentials")).toBeInTheDocument();
        });
    });

    it("has a forgot password link", () => {
        render(<LoginPage />);
        expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    });
});
