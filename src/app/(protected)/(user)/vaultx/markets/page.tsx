"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { buildColumns } from "./components/columns";
import type { MarketData } from "./data/schema";
import { MarketResponseSchema } from "./data/schema";
import { DataTable } from "./components/data-table";
import { Loader2 } from "lucide-react";
import { getCookie } from "@/lib/cookies";

// const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000").replace(/\/$/, "");
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://authbackend-cc2d.onrender.com").replace(/\/$/, "");

export default function DoctorInboxPage() {
    const [data, setData] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const loadInbox = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(`${API_BASE}/prices/snapshot`, {
                params: { category: "all" },
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCookie("csrf_token") ?? "",
                    // "Cache-Control": "no-store",
                },
            });

            // ✅ Parse & normalize: items is guaranteed array, all nullable fields have null (not undefined)
            const parsed = MarketResponseSchema.parse(res.data);
            // console.log(parsed)
            setData(parsed.items);

        } catch (e: any) {
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                router.replace("/login");
                return;
            }
            console.error("Failed to load snapshot:", e);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        let mounted = true;
        (async () => { if (mounted) await loadInbox(); })();
        return () => { mounted = false; };
    }, [loadInbox]);

    const columns = buildColumns(); // ensure columns are typed

    return (
        <div className="hidden h-full flex-1 flex-col space-y-2 px-2 md:flex mb-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading ? (
                <div className="min-h-[100vh] flex justify-center">
                    <div className="flex mt-10 gap-3 text-sm text-neutral-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading…</span>
                    </div>
                </div>
            ) : (
                <DataTable data={data} columns={columns} />
            )}
        </div>
    );
}
