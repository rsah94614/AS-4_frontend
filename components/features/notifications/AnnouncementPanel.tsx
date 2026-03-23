"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Send, X } from "lucide-react";
import { extractErrorMessage } from "@/lib/error-utils";
import type { AnnouncementRequest } from "@/types/notification-types";
import {
    fetchDepartments,
    fetchEmployeeOptions,
    postAnnouncement,
    type Department,
    type EmployeeOption,
} from "@/components/features/notifications/notification-admin-service";
import {
    FieldLabel,
    inputClass,
    inputFocus,
    ResultBanner,
} from "@/components/features/notifications/notifications-shared";

type TargetMode = "all" | "departments" | "employees";

function AudienceSummary({
    targetMode,
    deptCount,
    empCount,
}: {
    targetMode: TargetMode;
    deptCount: number;
    empCount: number;
}) {
    if (targetMode === "all") {
        return (
            <p className="text-[12px] leading-relaxed text-muted-foreground">
                This announcement will be broadcast to <strong>all active employees</strong>.
            </p>
        );
    }

    if (targetMode === "departments") {
        return (
            <p className="text-[12px] leading-relaxed text-muted-foreground">
                Will be sent to employees in{" "}
                <strong>
                    {deptCount === 0
                        ? "no departments selected"
                        : `${deptCount} department${deptCount !== 1 ? "s" : ""}`}
                </strong>.
            </p>
        );
    }

    return (
        <p className="text-[12px] leading-relaxed text-muted-foreground">
            Will be sent to{" "}
            <strong>
                {empCount === 0
                    ? "no employees selected"
                    : `${empCount} employee${empCount !== 1 ? "s" : ""}`}
            </strong>.
        </p>
    );
}

export function AnnouncementPanel({ onDone }: { onDone?: () => void }) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetMode, setTargetMode] = useState<TargetMode>("all");
    const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const [departments, setDepartments] = useState<Department[]>([]);
    const [deptLoading, setDeptLoading] = useState(false);
    const [deptError, setDeptError] = useState<string | null>(null);
    const [selectedDeptIds, setSelectedDeptIds] = useState<Set<string>>(new Set());

    const [empSearch, setEmpSearch] = useState("");
    const [empResults, setEmpResults] = useState<EmployeeOption[]>([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [empError, setEmpError] = useState<string | null>(null);
    const [selectedEmps, setSelectedEmps] = useState<Map<string, EmployeeOption>>(new Map());

    const deptLoaded = useRef(false);
    const empSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleTargetMode(mode: TargetMode) {
        setTargetMode(mode);

        if (mode === "departments" && !deptLoaded.current) {
            deptLoaded.current = true;
            setDeptLoading(true);
            setDeptError(null);
            fetchDepartments()
                .then(setDepartments)
                .catch((error) => setDeptError(extractErrorMessage(error, "Failed to load departments")))
                .finally(() => setDeptLoading(false));
        }
    }

    function toggleDept(id: string) {
        setSelectedDeptIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleEmp(employee: EmployeeOption) {
        setSelectedEmps((prev) => {
            const next = new Map(prev);
            if (next.has(employee.employee_id)) next.delete(employee.employee_id);
            else next.set(employee.employee_id, employee);
            return next;
        });
    }

    function handleEmpSearch(value: string) {
        setEmpSearch(value);
        if (empSearchTimer.current) clearTimeout(empSearchTimer.current);

        empSearchTimer.current = setTimeout(() => {
            if (!value.trim()) {
                setEmpResults([]);
                return;
            }

            setEmpLoading(true);
            setEmpError(null);
            fetchEmployeeOptions(value.trim())
                .then(setEmpResults)
                .catch((error) => setEmpError(extractErrorMessage(error, "Failed to search employees")))
                .finally(() => setEmpLoading(false));
        }, 350);
    }

    const canSubmit = (() => {
        if (!title.trim() || !message.trim()) return false;
        if (targetMode === "departments") return selectedDeptIds.size > 0;
        if (targetMode === "employees") return selectedEmps.size > 0;
        return true;
    })();

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!canSubmit) return;

        setResult(null);
        startTransition(async () => {
            try {
                const payload: AnnouncementRequest = {
                    title: title.trim(),
                    message: message.trim(),
                };

                if (targetMode === "departments") payload.department_ids = [...selectedDeptIds];
                if (targetMode === "employees") payload.employee_ids = [...selectedEmps.keys()];

                const response = await postAnnouncement(payload);
                setResult({
                    type: "success",
                    text: `Announcement sent to ${response.recipient_count} recipient${response.recipient_count !== 1 ? "s" : ""}.`,
                });

                setTitle("");
                setMessage("");
                setSelectedDeptIds(new Set());
                setSelectedEmps(new Map());
                setTargetMode("all");
                onDone?.();
            } catch (error: unknown) {
                setResult({
                    type: "error",
                    text: extractErrorMessage(error, "An unexpected error occurred."),
                });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {result && (
                <ResultBanner
                    type={result.type}
                    message={result.text}
                    onDismiss={() => setResult(null)}
                />
            )}

            <div>
                <FieldLabel required>Subject</FieldLabel>
                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Q2 Townhall scheduled for Friday"
                    className={inputClass}
                    style={inputFocus}
                    maxLength={200}
                    disabled={isPending}
                />
            </div>

            <div>
                <FieldLabel required>Message</FieldLabel>
                <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write your announcement here."
                    rows={4}
                    className={`${inputClass} resize-none`}
                    style={inputFocus}
                    maxLength={2000}
                    disabled={isPending}
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">{message.length}/2000</p>
            </div>

            <div>
                <FieldLabel>Send To</FieldLabel>
                <div className="flex gap-2">
                    {(["all", "departments", "employees"] as TargetMode[]).map((mode) => {
                        const labels: Record<TargetMode, string> = {
                            all: "All Employees",
                            departments: "By Department",
                            employees: "Specific Employees",
                        };
                        const active = targetMode === mode;

                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => handleTargetMode(mode)}
                                disabled={isPending}
                                className={`rounded-sm border px-3 py-1.5 text-[12px] font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-[#D1D5DB] bg-white text-[#374151]"}`}
                            >
                                {labels[mode]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {targetMode === "departments" && (
                <div>
                    <FieldLabel required>Select Departments</FieldLabel>
                    {deptLoading && (
                        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading departments...
                        </p>
                    )}
                    {deptError && <p className="text-[12px] text-[#991B1B]">{deptError}</p>}
                    {!deptLoading && !deptError && departments.length === 0 && (
                        <p className="text-[12px] text-muted-foreground">No departments found.</p>
                    )}
                    {departments.length > 0 && (
                        <div
                            className="mt-1 grid gap-1.5"
                            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
                        >
                            {departments.map((department) => {
                                const checked = selectedDeptIds.has(department.department_id);
                                return (
                                    <label
                                        key={department.department_id}
                                        className={`flex cursor-pointer select-none items-center gap-2 rounded-sm border px-3 py-2 text-[12.5px] transition ${checked ? "border-primary bg-[#EEF4FB] font-semibold text-primary" : "border-[#E5E7EB] bg-white font-normal text-[#374151]"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="accent-primary"
                                            checked={checked}
                                            onChange={() => toggleDept(department.department_id)}
                                            disabled={isPending}
                                        />
                                        <span className={checked ? "text-primary" : "text-[#374151]"}>
                                            {department.department_name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {targetMode === "employees" && (
                <div className="space-y-2">
                    <FieldLabel required>Search Employees</FieldLabel>
                    <div className="relative">
                        <input
                            type="text"
                            value={empSearch}
                            onChange={(event) => handleEmpSearch(event.target.value)}
                            placeholder="Type a name or email..."
                            className={inputClass}
                            style={inputFocus}
                            disabled={isPending}
                        />
                        {empLoading && (
                            <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    {empError && <p className="text-[12px] text-[#991B1B]">{empError}</p>}

                    {empResults.length > 0 && (
                        <div
                            className="overflow-hidden rounded-sm border divide-y divide-slate-50"
                            style={{ borderColor: "#E5E7EB" }}
                        >
                            {empResults.map((employee) => {
                                const selected = selectedEmps.has(employee.employee_id);
                                return (
                                    <button
                                        key={employee.employee_id}
                                        type="button"
                                        onClick={() => toggleEmp(employee)}
                                        disabled={isPending}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-muted"
                                    >
                                        <div>
                                            <p className="text-[13px] font-medium text-foreground">{employee.username}</p>
                                            <p className="text-[11px] text-muted-foreground">{employee.email}</p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${selected ? "bg-primary text-primary-foreground" : "bg-[#F3F4F6] text-[#6B7280]"}`}
                                        >
                                            {selected ? "Selected" : "Add"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedEmps.size > 0 && (
                        <div>
                            <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
                                Selected ({selectedEmps.size})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {[...selectedEmps.values()].map((employee) => (
                                    <span
                                        key={employee.employee_id}
                                        className="inline-flex items-center gap-1.5 rounded-sm bg-[#EEF4FB] px-2.5 py-1 text-[12px] font-medium text-primary"
                                    >
                                        {employee.username}
                                        <button
                                            type="button"
                                            onClick={() => toggleEmp(employee)}
                                            className="opacity-60 hover:opacity-100"
                                            disabled={isPending}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AudienceSummary
                targetMode={targetMode}
                deptCount={selectedDeptIds.size}
                empCount={selectedEmps.size}
            />

            <button
                type="submit"
                disabled={!canSubmit || isPending}
                className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" /> Send Announcement
                    </>
                )}
            </button>
        </form>
    );
}
