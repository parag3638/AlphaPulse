"use client";
import AuthGate from "@/components/auth/AuthGate";
import FullPageLoader from "@/components/auth/FullPageLoader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGate
            mode="block"
            requireRole="user"
            redirectTo="/"
            fallback={<FullPageLoader />}
        >
            {children}
        </AuthGate>


    );
}

// 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