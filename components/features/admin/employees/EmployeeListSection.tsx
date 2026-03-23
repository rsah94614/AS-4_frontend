import PaginationControls from "@/components/shared/PaginationControls";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeId, HOW_IT_WORKS_LIST, formatDate } from "@/lib/employee-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import { cn } from "@/lib/utils";
import { Department } from "@/types/department-types";
import { Designation } from "@/types/designation-types";
import { PaginationMeta } from "@/types/pagination";
import { Status } from "@/types/employee-types";
import { Employee } from "@/types/employee-types";
import { Users, UserPlus, Search, X, ChevronDown, Briefcase, Building2, Calendar, MoreVertical } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import HowItWorks from "../shared/HowItWorks";
import { ConfirmDeactivateDialog } from "./ConfirmDeactivateDialog";
import { CreateEmployeeDialog } from "./CreateEmployeeDialog";
import { EmployeeDetailDialog } from "./EmployeeDetailDialog";
import { StatusBadge } from "./StatusBadge";
import { employeesClient as empClient, orgClient } from "@/services/api-clients";

// ─── Employee List Section ────────────────────────────────────────────────────
export function EmployeeListSection({ toast }: { toast: (msg: string, t?: "success" | "error") => void }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebounced] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Employee | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [startEditMode, setStartEditMode] = useState(false);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [filterDept, setFilterDept] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const TABLE_COLS = "2fr 1.2fr 1.2fr 1fr 120px 40px";
    const [actionMenu, setActionMenu] = useState<{
        employee: Employee;
        rect: DOMRect;
    } | null>(null);
    const [statusTarget, setStatusTarget] = useState<Employee | null>(null);
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

    // Search only fires after 3+ characters (or empty to reset)
    useEffect(() => {
        if (search.length === 0 || search.length >= 3) {
            const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
            return () => clearTimeout(t);
        }
    }, [search]);



    const loadMeta = useCallback(async () => {
        try {
            const [dsgRes, dptRes] = await Promise.allSettled([
                orgClient.get("/designations"),
                orgClient.get("/departments"),
            ]);
            if (dsgRes.status === "fulfilled") {
                const d = dsgRes.value.data;
                const arr: Designation[] = Array.isArray(d) ? d : (d as { data?: Designation[] }).data ?? [];
                setDesignations(arr.sort((a, b) => a.designation_name.localeCompare(b.designation_name)));
            }
            if (dptRes.status === "fulfilled") {
                const d = dptRes.value.data;
                const arr: Department[] = Array.isArray(d) ? d : (d as { data?: Department[] }).data ?? [];
                setDepartments(arr.sort((a, b) => a.department_name.localeCompare(b.department_name)));
            }
        } catch {/* best-effort */ }
    }, []);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = { page, limit: 10 };
            if (debouncedSearch) params.search = debouncedSearch;
            if (filterDept) params.department_id = filterDept;
            if (filterStatus) params.status_id = filterStatus;
            const res = await empClient.get<{ data: Employee[]; pagination: PaginationMeta }>("/list", { params });
            const emps = res.data.data;
            setEmployees(emps);
            setPagination(res.data.pagination);
            setStatuses((prev) => {
                const map = new Map(prev.map((s) => [s.status_id, s]));
                for (const e of emps) {
                    if (e.status_id && e.status_name && !map.has(e.status_id))
                        map.set(e.status_id, { status_id: e.status_id, status_code: e.is_active ? "ACTIVE" : "INACTIVE", status_name: e.status_name });
                }
                return [...map.values()];
            });
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally { setLoading(false); }
    }, [page, debouncedSearch, filterDept, filterStatus, toast]);

    const loadAllEmployees = useCallback(async () => {
        try {
            const requestPage = (pg: number, limit: number) =>
                empClient.get<{ data: Employee[]; pagination?: PaginationMeta }>(
                    "/list",
                    { params: { page: pg, limit } }
                );

            let limit = 100;
            let first;
            try {
                first = await requestPage(1, limit);
            } catch {
                // Some deployments enforce lower max page sizes.
                limit = 20;
                first = await requestPage(1, limit);
            }

            const firstBatch = Array.isArray(first.data?.data) ? first.data.data : [];
            const totalPages = Math.max(1, Number(first.data?.pagination?.total_pages ?? 1));
            const all = [...firstBatch];

            for (let pg = 2; pg <= totalPages; pg += 1) {
                try {
                    const res = await requestPage(pg, limit);
                    const batch = Array.isArray(res.data?.data) ? res.data.data : [];
                    if (batch.length === 0) break;
                    all.push(...batch);
                } catch {
                    // Keep already-fetched pages so manager selectors still work.
                    break;
                }
            }

            setAllEmployees(all);
        } catch (err) {
            console.error("[loadAllEmployees]", err);
            // Fallback to currently visible rows when full list fetch fails.
            setAllEmployees((prev) => (prev.length > 0 ? prev : employees));
        }
    }, [employees]);

    useEffect(() => { loadMeta(); }, [loadMeta]);
    useEffect(() => { load(); }, [load]);
    useEffect(() => { loadAllEmployees(); }, [loadAllEmployees]);

    const getStatusByCode = useCallback(
        (code: "ACTIVE" | "INACTIVE") =>
            statuses.find((s) => {
                const sc = (s.status_code ?? "").toUpperCase();
                const sn = (s.status_name ?? "").toUpperCase();
                return sc === code || sn === code;
            }),
        [statuses]
    );

    const openDetails = (emp: Employee, edit = false) => {
        setStartEditMode(edit);
        // Open immediately using row data for snappy UX.
        setSelected(emp);
        setDetailOpen(true);

        // Hydrate with full detail in background (includes nested manager info).
        void empClient.get(`/${emp.employee_id}`)
            .then((res) => {
                const payload = (res.data && typeof res.data === "object" && "data" in res.data)
                    ? (res.data as { data: Record<string, unknown> }).data
                    : (res.data as Record<string, unknown>);

                if (!payload || typeof payload !== "object") return;

                const manager = (payload.manager ?? null) as { employee_id?: string; username?: string } | null;
                const designation = (payload.designation ?? null) as { designation_id?: string; designation_name?: string } | null;
                const department = (payload.department ?? null) as { department_id?: string; department_name?: string } | null;
                const status = (payload.status ?? null) as { status_id?: string; status_name?: string; status_code?: string } | null;

                setSelected((prev) => {
                    // Ignore stale responses if user switched records meanwhile.
                    if (!prev || prev.employee_id !== emp.employee_id) return prev;

                    const payloadManagerId = normalizeId(
                        (payload.manager_id as string | undefined) ?? manager?.employee_id
                    );
                    const payloadManagerName =
                        (payload.manager_name as string | undefined) ?? manager?.username;
                    const payloadDesignationId =
                        (payload.designation_id as string | undefined) ?? designation?.designation_id;
                    const payloadDesignationName =
                        (payload.designation_name as string | undefined) ?? designation?.designation_name;
                    const payloadDepartmentId =
                        (payload.department_id as string | undefined) ?? department?.department_id;
                    const payloadDepartmentName =
                        (payload.department_name as string | undefined) ?? department?.department_name;
                    const payloadStatusId =
                        (payload.status_id as string | undefined) ?? status?.status_id;
                    const payloadStatusName =
                        (payload.status_name as string | undefined) ?? status?.status_name;

                    return {
                        ...prev,
                        ...payload,
                        manager_id: payloadManagerId || normalizeId(prev.manager_id) || normalizeId(emp.manager_id),
                        manager_name: payloadManagerName ?? prev.manager_name ?? emp.manager_name,
                        designation_id: payloadDesignationId ?? prev.designation_id ?? emp.designation_id,
                        designation_name: payloadDesignationName ?? prev.designation_name ?? emp.designation_name,
                        department_id: payloadDepartmentId ?? prev.department_id ?? emp.department_id,
                        department_name: payloadDepartmentName ?? prev.department_name ?? emp.department_name,
                        status_id: payloadStatusId ?? prev.status_id ?? emp.status_id,
                        status_name: payloadStatusName ?? prev.status_name ?? emp.status_name,
                        is_active: status?.status_code
                            ? status.status_code.toUpperCase() === "ACTIVE"
                            : prev.is_active,
                    } as Employee;
                });
            })
            .catch(() => {
                // Keep row data fallback silently.
            });
    };
    const closeDetails = () => {
        setDetailOpen(false);
        setStartEditMode(false);
        setSelected(null);
    };

    const handleActivate = async (emp: Employee) => {
        const activeStatus = getStatusByCode("ACTIVE");
        if (!activeStatus?.status_id) {
            toast("ACTIVE status not found", "error");
            return;
        }
        try {
            setStatusSubmitting(true);
            await empClient.put(`/${emp.employee_id}`, { status_id: activeStatus.status_id });
            toast("Employee activated");
            await load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Activation failed"), "error");
        } finally {
            setStatusSubmitting(false);
        }
    };

    const handleDeactivate = async (emp: Employee) => {
        try {
            setStatusSubmitting(true);
            await empClient.patch(`/${emp.employee_id}`);
            toast("Employee deactivated");
            setStatusTarget(null);
            await load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Deactivation failed"), "error");
        } finally {
            setStatusSubmitting(false);
        }
    };

    useEffect(() => {
        if (!actionMenu) return;
        const closeMenu = () => setActionMenu(null);
        const onOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (target.closest("[data-emp-menu]") || target.closest("[data-emp-menu-btn]")) return;
            closeMenu();
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMenu();
        };
        window.addEventListener("mousedown", onOutside);
        window.addEventListener("resize", closeMenu);
        window.addEventListener("scroll", closeMenu, true);
        window.addEventListener("keydown", onEsc);
        return () => {
            window.removeEventListener("mousedown", onOutside);
            window.removeEventListener("resize", closeMenu);
            window.removeEventListener("scroll", closeMenu, true);
            window.removeEventListener("keydown", onEsc);
        };
    }, [actionMenu]);

    return (
        <div className="w-full">
            <HowItWorks steps={HOW_IT_WORKS_LIST} />

            <div className="bg-white border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-primary shrink-0" />
                        <h2 className="text-sm font-bold text-primary">Employees</h2>
                        {!loading && pagination && (
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
                                {pagination.total}
                            </span>
                        )}
                    </div>
                    <button onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#004C8F" }}>
                        <UserPlus size={13} />
                        New Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Search name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value.trimStart())}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-muted text-sm
                                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {departments.length > 0 && (
                        <div className="relative">
                            <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
                                className="border border-border rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8
                                    focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium text-foreground">
                                <option value="">All Departments</option>
                                {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                    )}
                    {statuses.length > 0 && (
                        <div className="relative">
                            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                className="border border-border rounded-lg px-3 py-2 text-xs bg-white appearance-none pr-8
                                    focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium text-foreground">
                                <option value="">All Statuses</option>
                                {statuses.map((s) => <option key={s.status_id} value={s.status_id}>{s.status_name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-5 space-y-2">
                        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users size={20} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">
                            {debouncedSearch || filterDept || filterStatus ? "No matching employees" : "No employees yet"}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Column headers */}
                        <div className="grid px-5 py-2 bg-muted border-b border-gray-100"
                            style={{ gridTemplateColumns: TABLE_COLS }}>
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Employee</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Designation</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Department</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Joined</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground text-left">Status</span>
                            <span className="sr-only">Actions</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {employees.map((emp) => (
                                <div key={emp.employee_id}
                                    className="grid px-5 items-center gap-x-2"
                                    style={{ gridTemplateColumns: TABLE_COLS, minHeight: "52px" }}
                                >

                                    {/* Name + email */}
                                    <div className="flex flex-col justify-center min-w-0 py-2">
                                        <p className="text-[14px] font-semibold text-primary truncate leading-5">{emp.username}</p>
                                        <p className="text-[12px] text-muted-foreground truncate leading-4">{emp.email}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Briefcase size={12} className="text-gray-300 shrink-0" />
                                        <span className="text-[13px] text-foreground truncate">{emp.designation_name ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Building2 size={12} className="text-gray-300 shrink-0" />
                                        <span className="text-[13px] text-foreground truncate">{emp.department_name ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-300 shrink-0" />
                                        <span className="text-[12px] text-muted-foreground">{formatDate(emp.date_of_joining)}</span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <StatusBadge isActive={emp.is_active} />
                                    </div>
                                    <div className="relative flex items-center justify-center">
                                        <button
                                            type="button"
                                            data-emp-menu-btn
                                            onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setActionMenu((prev) => {
                                                    if (prev?.employee.employee_id === emp.employee_id) return null;
                                                    return { employee: emp, rect };
                                                });
                                            }}
                                            className={cn(
                                                "w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors",
                                                actionMenu?.employee.employee_id === emp.employee_id && "bg-muted"
                                            )}
                                        >
                                            <MoreVertical size={14} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-5 py-3 bg-muted border-t border-gray-100">
                    {pagination && pagination.total_pages > 1 && (
                        <PaginationControls
                            currentPage={page}
                            totalPages={pagination.total_pages}
                            hasPrevious={pagination.has_previous}
                            hasNext={pagination.has_next}
                            onPageChange={setPage}
                            className="mt-0"
                        />
                    )}
                </div>
            </div>

            <CreateEmployeeDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { load(); loadAllEmployees(); }}
                toast={toast} designations={designations} departments={departments} employees={allEmployees.length > 0 ? allEmployees : employees} />
            <EmployeeDetailDialog employee={selected} open={detailOpen} onClose={closeDetails}
                onUpdated={() => { load(); loadAllEmployees(); }} toast={toast} designations={designations} departments={departments}
                statuses={statuses} employees={allEmployees.length > 0 ? allEmployees : employees} startInEdit={startEditMode} />
            {actionMenu && (() => {
                const MENU_WIDTH = 160;
                const MENU_HEIGHT = 112;
                const GAP = 4;
                const viewportHeight =
                    typeof window !== "undefined" ? window.innerHeight : 9999;
                const left = Math.max(8, actionMenu.rect.right - MENU_WIDTH);
                const topDown = actionMenu.rect.bottom + GAP;
                const topUp = actionMenu.rect.top - MENU_HEIGHT - GAP;
                const top =
                    topDown + MENU_HEIGHT <= viewportHeight - 8 || topUp < 8
                        ? topDown
                        : topUp;

                return (
                    <div
                        data-emp-menu
                        className="fixed z-120 w-[160px] bg-white border border-border rounded-md shadow-xl py-1"
                        style={{ left, top }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                const selectedEmp = actionMenu.employee;
                                setActionMenu(null);
                                openDetails(selectedEmp, false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            View Details
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const selectedEmp = actionMenu.employee;
                                setActionMenu(null);
                                openDetails(selectedEmp, true);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const selectedEmp = actionMenu.employee;
                                setActionMenu(null);
                                if (selectedEmp.is_active) setStatusTarget(selectedEmp);
                                else handleActivate(selectedEmp);
                            }}
                            className={cn(
                                "w-full text-left px-2.5 py-1.5 text-[13px] font-medium hover:bg-muted transition-colors",
                                actionMenu.employee.is_active ? "text-rose-600" : "text-emerald-600"
                            )}
                        >
                            {actionMenu.employee.is_active ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                );
            })()}
            <ConfirmDeactivateDialog
                open={!!statusTarget}
                username={statusTarget?.username ?? ""}
                onConfirm={() => statusTarget && handleDeactivate(statusTarget)}
                onCancel={() => setStatusTarget(null)}
                loading={statusSubmitting}
            />
        </div>
    );
}
