"use client";
import AuthGate from "@/components/auth/AuthGate";
import FullPageLoader from "@/components/auth/FullPageLoader";


export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
