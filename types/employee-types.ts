export interface Designation { designation_id: string; designation_name: string; }
export interface Department { department_id: string; department_name: string; }
export interface Status { status_id: string; status_code: string; status_name: string; }

export interface Employee {
    employee_id: string;
    username: string;
    email: string;
    designation_id?: string;
    designation_name?: string;
    department_id?: string;
    department_name?: string;
    manager_id?: string;
    manager_name?: string;
    date_of_joining: string;
    date_of_birth?: string;
    status_id?: string;
    status_name?: string;
    is_active: boolean;
    created_at: string;
}

export interface PaginationMeta {
    current_page: number; per_page: number; total: number;
    total_pages: number; has_next: boolean; has_previous: boolean;
}

export interface BulkImportRow {
    row: number; username?: string; email?: string;
    status: "success" | "error";
    error?: string; employee_id?: string;
}
export interface BulkImportResponse {
    total: number; succeeded: number; failed: number;
    results: BulkImportRow[];
}

export type Tab = "list" | "bulk";
