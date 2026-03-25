import axios from "axios";
import { uploadToStorage } from "@/services/s3";

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        put: jest.fn(),
    },
}));

const mockPost = axios.post as jest.MockedFunction<typeof axios.post>;
const mockPut = axios.put as jest.MockedFunction<typeof axios.put>;

// Set required env vars
const originalEnv = process.env;
beforeAll(() => {
    process.env = {
        ...originalEnv,
        NEXT_PUBLIC_S3_REGION: "us-east-1",
        NEXT_PUBLIC_S3_BUCKET: "test-bucket",
    };
});
afterAll(() => {
    process.env = originalEnv;
});

function makeFile(name: string, type: string, sizeBytes: number): File {
    const buffer = new ArrayBuffer(sizeBytes);
    return new File([buffer], name, { type });
}

describe("uploadToStorage", () => {
    beforeEach(() => jest.clearAllMocks());

    it("rejects unsupported file type", async () => {
        const file = makeFile("doc.pdf", "application/pdf", 1024);
        await expect(uploadToStorage(file)).rejects.toThrow("Unsupported file type");
    });

    it("rejects oversized image (> 10 MB)", async () => {
        const file = makeFile("big.jpg", "image/jpeg", 11 * 1024 * 1024);
        await expect(uploadToStorage(file)).rejects.toThrow("Image too large");
    });

    it("rejects oversized video (> 50 MB)", async () => {
        const file = makeFile("big.mp4", "video/mp4", 51 * 1024 * 1024);
        await expect(uploadToStorage(file)).rejects.toThrow("Video too large");
    });

    it("uploads an image successfully", async () => {
        const file = makeFile("photo.jpg", "image/jpeg", 5000);
        mockPost.mockResolvedValue({ data: { uploadUrl: "https://s3.presigned.url" } });
        mockPut.mockResolvedValue({});

        const result = await uploadToStorage(file);

        expect(mockPost).toHaveBeenCalledWith("/api/upload/presign", expect.objectContaining({
            contentType: "image/jpeg",
        }));
        expect(mockPut).toHaveBeenCalledWith("https://s3.presigned.url", file, expect.any(Object));
        expect(result.resourceType).toBe("image");
        expect(result.format).toBe("jpg");
        expect(result.bytes).toBe(5000);
        expect(result.url).toContain(".s3.us-east-1.amazonaws.com");
    });

    it("uploads a video (quicktime/mov) successfully", async () => {
        const file = makeFile("clip.mov", "video/quicktime", 10000);
        mockPost.mockResolvedValue({ data: { uploadUrl: "https://s3.presigned.url" } });
        mockPut.mockResolvedValue({});

        const result = await uploadToStorage(file);
        expect(result.resourceType).toBe("video");
        expect(result.format).toBe("mov");
    });

    it("uploads a PNG successfully", async () => {
        const file = makeFile("img.png", "image/png", 2000);
        mockPost.mockResolvedValue({ data: { uploadUrl: "https://s3.presigned.url" } });
        mockPut.mockResolvedValue({});

        const result = await uploadToStorage(file);
        expect(result.format).toBe("png");
    });

    it("throws when S3 PUT fails", async () => {
        const file = makeFile("photo.jpg", "image/jpeg", 5000);
        mockPost.mockResolvedValue({ data: { uploadUrl: "https://s3.presigned.url" } });
        mockPut.mockRejectedValue({ response: { status: 403, data: "Forbidden" } });

        await expect(uploadToStorage(file)).rejects.toThrow("S3 upload failed");
    });
});
