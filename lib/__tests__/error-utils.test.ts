import { extractErrorMessage, createErrorResponse } from "@/lib/error-utils";
import axios from "axios";

describe("extractErrorMessage", () => {
    it("extracts detail string from Axios error", () => {
        const error = new axios.AxiosError("fail");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response = { data: { detail: "Token expired" } };
        expect(extractErrorMessage(error)).toBe("Token expired");
    });

    it("extracts first validation msg from Axios error with detail array", () => {
        const error = new axios.AxiosError("fail");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response = { data: { detail: [{ msg: "field required" }] } };
        expect(extractErrorMessage(error)).toBe("field required");
    });

    it("extracts message field from Axios error", () => {
        const error = new axios.AxiosError("fail");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response = { data: { message: "Not found" } };
        expect(extractErrorMessage(error)).toBe("Not found");
    });

    it("extracts error field from Axios error", () => {
        const error = new axios.AxiosError("fail");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response = { data: { error: "Bad request" } };
        expect(extractErrorMessage(error)).toBe("Bad request");
    });

    it("falls back to error.message for Axios error without response data", () => {
        const error = new axios.AxiosError("Network Error");
        expect(extractErrorMessage(error)).toBe("An unexpected error occurred");
    });

    it("extracts message from standard Error", () => {
        expect(extractErrorMessage(new Error("something broke"))).toBe("something broke");
    });

    it("returns string directly", () => {
        expect(extractErrorMessage("raw error")).toBe("raw error");
    });

    it("extracts detail from plain object", () => {
        expect(extractErrorMessage({ detail: "from object" })).toBe("from object");
    });

    it("extracts message from plain object", () => {
        expect(extractErrorMessage({ message: "obj msg" })).toBe("obj msg");
    });

    it("extracts error from plain object", () => {
        expect(extractErrorMessage({ error: "obj error" })).toBe("obj error");
    });

    it("returns fallback for unknown types", () => {
        expect(extractErrorMessage(42)).toBe("An unexpected error occurred");
        expect(extractErrorMessage(null)).toBe("An unexpected error occurred");
    });

    it("uses custom fallback", () => {
        expect(extractErrorMessage(42, "Custom fallback")).toBe("Custom fallback");
    });
});

describe("createErrorResponse", () => {
    it("returns structured error response", () => {
        const result = createErrorResponse(new Error("oops"));
        expect(result).toEqual({ success: false, error: "oops" });
    });

    it("uses custom fallback message", () => {
        const result = createErrorResponse(null, "Something failed");
        expect(result).toEqual({ success: false, error: "Something failed" });
    });
});
