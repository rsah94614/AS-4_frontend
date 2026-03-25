import { generateCurl, maskHeaders, prettifyJson, formatDuration } from "@/lib/logger-utils";
import { makeLogEntry } from "@/test-utils/mock-factories";

describe("generateCurl", () => {
    it("generates a GET curl without -X flag", () => {
        const log = makeLogEntry({ method: "GET", url: "http://localhost/api/test" });
        const curl = generateCurl(log);
        expect(curl).toContain("curl");
        expect(curl).toContain("'http://localhost/api/test'");
        expect(curl).not.toContain("-X");
    });

    it("generates a POST curl with -X POST", () => {
        const log = makeLogEntry({ method: "POST", url: "http://localhost/api/test" });
        const curl = generateCurl(log);
        expect(curl).toContain("-X POST");
    });

    it("includes request body with -d flag", () => {
        const log = makeLogEntry({
            method: "POST",
            url: "http://localhost/api/test",
            requestBody: { key: "value" },
        });
        const curl = generateCurl(log);
        expect(curl).toContain("-d");
        expect(curl).toContain('"key":"value"');
    });

    it("includes masked headers", () => {
        const log = makeLogEntry({
            requestHeaders: { Authorization: "Bearer secret", "Content-Type": "application/json" },
        });
        const curl = generateCurl(log);
        expect(curl).toContain("Bearer ***MASKED***");
        expect(curl).toContain("application/json");
    });

    it("handles string request body", () => {
        const log = makeLogEntry({ method: "POST", requestBody: "raw-body" });
        const curl = generateCurl(log);
        expect(curl).toContain("-d 'raw-body'");
    });
});

describe("maskHeaders", () => {
    it("masks Authorization header", () => {
        const result = maskHeaders({ Authorization: "Bearer abc123" });
        expect(result.Authorization).toBe("Bearer ***MASKED***");
    });

    it("masks token without scheme", () => {
        const result = maskHeaders({ authorization: "some-token" });
        expect(result.authorization).toBe("***MASKED***");
    });

    it("preserves non-sensitive headers", () => {
        const result = maskHeaders({ "Content-Type": "application/json" });
        expect(result["Content-Type"]).toBe("application/json");
    });

    it("returns empty object for null/undefined", () => {
        expect(maskHeaders(null as unknown as Record<string, string>)).toEqual({});
        expect(maskHeaders(undefined as unknown as Record<string, string>)).toEqual({});
    });
});

describe("prettifyJson", () => {
    it("pretty-prints an object", () => {
        const result = prettifyJson({ a: 1 });
        expect(result).toBe(JSON.stringify({ a: 1 }, null, 2));
    });

    it('returns "null" for null', () => {
        expect(prettifyJson(null)).toBe("null");
    });

    it('returns "null" for undefined', () => {
        expect(prettifyJson(undefined)).toBe("null");
    });
});

describe("formatDuration", () => {
    it('returns dash for null', () => {
        expect(formatDuration(null)).toBe("—");
    });

    it("formats milliseconds under 1000", () => {
        expect(formatDuration(250)).toBe("250ms");
    });

    it("formats seconds for 1000+", () => {
        expect(formatDuration(1500)).toBe("1.50s");
    });

    it("rounds milliseconds", () => {
        expect(formatDuration(99.7)).toBe("100ms");
    });
});
