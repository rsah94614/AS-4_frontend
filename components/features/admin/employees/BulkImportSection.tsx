import { CSV_TEMPLATE, HOW_IT_WORKS_BULK } from "@/lib/employee-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import { cn } from "@/lib/utils";
import { BulkImportResponse } from "@/types/employee-types";
import { FileSpreadsheet, Download, X, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import HowItWorks from "../shared/HowItWorks";

import { authClient } from "@/services/api-clients";

async function authBulkImport(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await authClient.post<BulkImportResponse>("/bulk-import", form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
}

export function BulkImportSection({ toast }: { toast: (msg: string, t?: "success" | "error") => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUpl] = useState(false);
    const [result, setResult] = useState<BulkImportResponse | null>(null);
    const [resultFilter, setFlt] = useState<"all" | "success" | "error">("all");

    const handleFile = (f: File) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (ext !== "csv" && ext !== "xlsx") {
            toast("Only .csv and .xlsx files are supported", "error"); return;
        }
        setFile(f); setResult(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            setUpl(true);
            const res = await authBulkImport(file);
            setResult(res);
            if (res.failed === 0) toast(`All ${res.succeeded} employees created successfully`);
            else toast(`${res.succeeded} created, ${res.failed} failed — review errors below`, "error");
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Upload failed"), "error");
        } finally { setUpl(false); }
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "employee_import_template.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = result?.results.filter((r) =>
        resultFilter === "all" ? true : r.status === resultFilter
    ) ?? [];

    return (
        <div className="w-full">
            <HowItWorks steps={HOW_IT_WORKS_BULK} />

            <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={14} className="text-primary shrink-0" />
                        <h2 className="text-sm font-bold text-primary">Bulk Import Employees</h2>
                    </div>
                    <button onClick={downloadTemplate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-all">
                        <Download size={12} /> Download Template
                    </button>
                </div>

                <div className="p-5">

                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                            file ? "border-primary bg-blue-50/30" : "border-border hover:border-border hover:bg-muted"
                        )}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    >
                        <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF2F7" }}>
                                    <FileSpreadsheet size={18} style={{ color: "#003580" }} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-primary truncate max-w-xs">{file.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); if (inputRef.current) inputRef.current.value = ""; }}
                                    className="w-6 h-6 rounded-full flex items-center justify-center bg-muted hover:bg-secondary transition-colors shrink-0">
                                    <X size={12} className="text-muted-foreground" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 bg-muted">
                                    <Upload size={18} className="text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold text-foreground mb-1">Drop your CSV or XLSX here</p>
                                <p className="text-[11px] text-muted-foreground">or click to browse</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-5 py-4 bg-muted border-t border-gray-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground truncate">
                        {file ? `Ready: ${file.name}` : "No file selected"}
                    </p>
                    <button onClick={handleUpload} disabled={!file || uploading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "#003580" }}>
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload size={13} />}
                        {uploading ? "Importing…" : "Import Employees"}
                    </button>
                </div>
            </div>

            {result && (
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-primary">Import Results</p>
                            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full tabular-nums">
                                {result.total} rows
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#065F46" }}>
                                <CheckCircle2 size={13} /> {result.succeeded}
                            </span>
                            {result.failed > 0 && (
                                <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                    <XCircle size={13} /> {result.failed} failed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="px-5 pt-3 pb-0 flex gap-1 border-b border-gray-100">
                        {(["all", "success", "error"] as const).map((f) => (
                            <button key={f} onClick={() => setFlt(f)}
                                className="px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all capitalize whitespace-nowrap"
                                style={resultFilter === f
                                    ? { color: "#003580", borderColor: "#003580" }
                                    : { color: "#9CA3AF", borderColor: "transparent" }}>
                                {f === "all" ? `All (${result.total})` : f === "success" ? `Success (${result.succeeded})` : `Failed (${result.failed})`}
                            </button>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {filtered.map((row) => (
                            <div key={row.row} className="flex items-center px-5 py-3 gap-4">
                                <span className="text-[10px] font-black text-muted-foreground tabular-nums w-8 shrink-0">#{row.row}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{row.username ?? "—"}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{row.email ?? "—"}</p>
                                </div>
                                {row.status === "success" ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 bg-emerald-100 text-emerald-800">
                                        Created
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                            Error
                                        </span>
                                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{row.error}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}