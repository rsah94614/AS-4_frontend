import { useLoggerStore } from "@/lib/logger-store";
import { makeLogEntry } from "@/test-utils/mock-factories";

describe("useLoggerStore", () => {
    beforeEach(() => {
        useLoggerStore.setState({
            logs: [],
            filters: { method: "ALL", status: "ALL", hideNotifications: true, urlSearch: "" },
        });
    });

    describe("addLog", () => {
        it("prepends a log entry", () => {
            const entry = makeLogEntry({ id: "log-1" });
            useLoggerStore.getState().addLog(entry);
            expect(useLoggerStore.getState().logs).toHaveLength(1);
            expect(useLoggerStore.getState().logs[0].id).toBe("log-1");
        });

        it("prepends new entries at the start", () => {
            useLoggerStore.getState().addLog(makeLogEntry({ id: "first" }));
            useLoggerStore.getState().addLog(makeLogEntry({ id: "second" }));
            expect(useLoggerStore.getState().logs[0].id).toBe("second");
            expect(useLoggerStore.getState().logs[1].id).toBe("first");
        });

        it("caps logs at 500", () => {
            for (let i = 0; i < 510; i++) {
                useLoggerStore.getState().addLog(makeLogEntry({ id: `log-${i}` }));
            }
            expect(useLoggerStore.getState().logs).toHaveLength(500);
        });
    });

    describe("clearLogs", () => {
        it("empties the logs array", () => {
            useLoggerStore.getState().addLog(makeLogEntry());
            useLoggerStore.getState().clearLogs();
            expect(useLoggerStore.getState().logs).toHaveLength(0);
        });
    });

    describe("setFilter", () => {
        it("merges partial filter", () => {
            useLoggerStore.getState().setFilter({ method: "POST" });
            expect(useLoggerStore.getState().filters.method).toBe("POST");
            expect(useLoggerStore.getState().filters.status).toBe("ALL");
        });
    });

    describe("getFilteredLogs", () => {
        beforeEach(() => {
            useLoggerStore.getState().addLog(makeLogEntry({ id: "get-200", method: "GET", status: 200, url: "http://localhost/api/users" }));
            useLoggerStore.getState().addLog(makeLogEntry({ id: "post-201", method: "POST", status: 201, url: "http://localhost/api/users" }));
            useLoggerStore.getState().addLog(makeLogEntry({ id: "get-404", method: "GET", status: 404, url: "http://localhost/api/missing" }));
            useLoggerStore.getState().addLog(makeLogEntry({ id: "get-500", method: "GET", status: 500, url: "http://localhost/api/error" }));
            useLoggerStore.getState().addLog(makeLogEntry({ id: "notif", method: "GET", status: 200, url: "http://localhost/notifications/unread-count" }));
        });

        it("returns all non-noise logs with default filters", () => {
            const filtered = useLoggerStore.getState().getFilteredLogs();
            // hideNotifications is true by default, so notif entry is excluded
            expect(filtered).toHaveLength(4);
        });

        it("filters by method", () => {
            useLoggerStore.getState().setFilter({ method: "POST" });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe("post-201");
        });

        it("filters by 2xx status", () => {
            useLoggerStore.getState().setFilter({ status: "2xx", hideNotifications: false });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered.every((l) => l.status! >= 200 && l.status! < 300)).toBe(true);
        });

        it("filters by 4xx status", () => {
            useLoggerStore.getState().setFilter({ status: "4xx" });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe("get-404");
        });

        it("filters by 5xx status", () => {
            useLoggerStore.getState().setFilter({ status: "5xx" });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe("get-500");
        });

        it("filters by URL search", () => {
            useLoggerStore.getState().setFilter({ urlSearch: "missing" });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe("get-404");
        });

        it("includes notification URLs when hideNotifications is false", () => {
            useLoggerStore.getState().setFilter({ hideNotifications: false });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered).toHaveLength(5);
        });

        it("handles null status", () => {
            useLoggerStore.getState().addLog(makeLogEntry({ id: "null-status", status: null }));
            useLoggerStore.getState().setFilter({ status: "2xx" });
            const filtered = useLoggerStore.getState().getFilteredLogs();
            expect(filtered.find((l) => l.id === "null-status")).toBeUndefined();
        });
    });
});
