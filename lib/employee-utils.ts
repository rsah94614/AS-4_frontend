export function todayStr() {
    return new Date().toISOString().split("T")[0];
}

export function maxDobStr() {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
}

export const AVATAR_COLORS = ["#004C8F", "#1E3A5F", "#14532D", "#7C2D12", "#6D28D9", "#0F766E"];

export function initials(name: string) {
    return name.split(/[\s._-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function formatDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function normalizeId(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        const obj = value as { employee_id?: unknown; id?: unknown; value?: unknown };
        if (obj.employee_id !== undefined) return normalizeId(obj.employee_id);
        if (obj.id !== undefined) return normalizeId(obj.id);
        if (obj.value !== undefined) return normalizeId(obj.value);
    }
    const normalized = String(value).trim().replace(/^\{|\}$/g, "");
    if (/^[0-9a-f-]{8}-[0-9a-f-]{4}-[1-5][0-9a-f-]{3}-[89ab][0-9a-f-]{3}-[0-9a-f-]{12}$/i.test(normalized)) {
        return normalized.toLowerCase();
    }
    return normalized;
}

export const HOW_IT_WORKS_LIST = [
    { n: "01", title: "Create Employee", desc: "Add employees individually via the form, providing all required profile details." },
    { n: "02", title: "Assign Manager", desc: "Set manager_id to build the hierarchy used by digest and recognition scoping." },
    { n: "03", title: "Set DOB", desc: "Date of birth enables birthday celebration notifications from the celebration worker." },
    { n: "04", title: "Manage Status", desc: "Deactivate an employee via the detail panel — soft-deletes without losing history." },
];

export const HOW_IT_WORKS_BULK = [
    { n: "01", title: "Download Template", desc: "Download the CSV template with correct column headers pre-filled." },
    { n: "02", title: "Fill Data", desc: "Required: username, email, password, designation_id, department_id. Optional: manager_id, date_of_birth." },
    { n: "03", title: "Upload File", desc: "Upload your completed CSV or XLSX file. Each row is processed independently." },
    { n: "04", title: "Review Results", desc: "Successful rows are created immediately. Errors are listed per-row — fix and re-upload." },
];

export const REQUIRED_COLS = ["username", "email", "password", "designation_id", "department_id"];
export const OPTIONAL_COLS = ["manager_id", "date_of_birth"];
export const CSV_TEMPLATE = [
    [...REQUIRED_COLS, ...OPTIONAL_COLS].join(","),
    "john.doe,john.doe@company.com,Passw0rd!,<designation_uuid>,<department_uuid>,<manager_uuid>,1990-05-20",
].join("\n");

