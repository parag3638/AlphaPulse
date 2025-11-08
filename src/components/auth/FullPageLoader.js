
"use client";
import { Loader2 } from "lucide-react";

export default function FullPageLoader() {
    return (
        <div className="min-h-[100vh] flex justify-center">
            <div className="flex mt-10 gap-3 text-sm text-neutral-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Checking session…</span>
            </div>
        </div>
    );
}
