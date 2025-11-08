"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import { AlertCircleIcon, Timer, CircleAlert, HeartPulse, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ChartBarBuckets } from "./components/BarChart";
import StatusPie from "./components/ProductWiseAlert";
import { Skeleton } from "@/components/ui/skeleton";
import DiagnosisMixCard from "./components/PipelineCard";
import ActiveCasesCard from "./components/CaseCard";
import { ChartLineLinear } from "./components/LineChart";

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loader, setLoader] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoader(true);
        const start = Date.now();

        axios
            .get("https://authbackend-cc2d.onrender.com/doctor/dashboard", {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            })
            .then((res) => {
                const elapsed = Date.now() - start;
                const remaining = Math.max(0, 2000 - elapsed); // keep loader ≥ 2s
                setTimeout(() => {
                    setData(res.data);
                    setLoader(false);
                }, remaining);
            })
            .catch((err) => {
                const elapsed = Date.now() - start;
                const remaining = Math.max(0, 2000 - elapsed);

                setTimeout(() => {
                    if (err?.response?.status === 401) {
                        // redirect to login if unauthorized
                        window.location.href = "/login";
                        return;
                    }
                    setError(err.message);
                    setLoader(false);
                }, remaining);
            });
    }, []);


    if (error) {
        return (
            <div className="w-full pt-4 flex justify-center text-center text-sm text-destructive">
                Error loading dashboard: <span className="ml-1 font-medium">{error}</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Container pinned to 2xl to preserve comfy sizing */}
            <div className="mx-auto px-3 sm:px-4 pb-6 space-y-5">

                {/* ---------- KPI + CHARTS ---------- */}
                <div className="grid gap-4
                        grid-cols-1
                        md:grid-cols-2
                        xl:grid-cols-12">
                    {/* KPIs (full on sm, 2-up on md, 4-up on xl/2xl) */}
                    {[
                        { title: "Total Cases", icon: Bell, key: "totalCases", footer: "all-time total" },
                        { title: "Avg Resolution Time", icon: Timer, key: "avgResolutionTime", footer: "lifetime average (in days)" },
                        { title: "Pending Cases", icon: CircleAlert, key: "pendingCases", footer: "ongoing from all time" },
                        { title: "Avg Age", icon: HeartPulse, key: "avgAge", footer: "all-time average age" },
                    ].map((item) => (
                        <Card
                            key={item.key}
                            className="
                                col-span-1
                                md:col-span-1
                                xl:col-span-3
                                min-h-[140px]
                            "
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-6 py-2">
                                {loader ? (
                                    <div className="flex flex-col space-y-2">
                                        <Skeleton className="h-6 w-[100px]" />
                                        <Skeleton className="h-4 w-[140px]" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {data?.kpis?.[item.key] ?? "--"}
                                        </div>
                                        <p className="text-xs text-muted-foreground pt-[1px]">{item.footer}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <Separator className="my-1 col-span-1 md:col-span-2 xl:col-span-12" />
                </div>
                <div className="grid gap-4
                        grid-cols-1
                        lg:grid-cols-2
                        2xl:grid-cols-12">
                    {/* Charts — stack on small, 2-up on md, 3-up on xl/2xl */}
                    {loader ? (
                        <>
                            <>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Card
                                        key={i}
                                        className={`
                                            col-span-1
                                            md:col-span-1
                                            2xl:col-span-4
                                            min-h-[380px] md:min-h-[380px]
                                            ${i === 3 ? '2xl:hidden' : ''}
                                        `}
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                <Skeleton className="h-5 w-[200px]" />
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <Skeleton className="h-56 md:h-72 w-full" />
                                        </CardContent>

                                        <CardFooter className="flex-col space-y-2">
                                            <Skeleton className="h-4 w-[240px]" />
                                            <Skeleton className="h-4 w-[180px]" />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </>

                        </>
                    ) : (
                        <>
                            <Card className="col-span-1 md:col-span-1 2xl:col-span-4 min-h-[380px] md:min-h-[380px]">
                                <ChartLineLinear
                                    data={data?.charts?.lineChart}
                                    title="Cases Over Time"
                                    description="Based on intake session counts"
                                    color="var(--chart-2)"
                                    trendText="Up 13% from last week"
                                />
                            </Card>

                            <Card className="col-span-1 md:col-span-1 2xl:col-span-4 min-h-[380px] md:min-h-[380px]">
                                <DiagnosisMixCard
                                    data={data?.charts?.stackedChart || []}
                                // topN={5}
                                />
                            </Card>

                            <Card className="col-span-1 md:col-span-1 2xl:col-span-4 min-h-[380px] md:min-h-[380px]">
                                <ChartBarBuckets
                                    data={data?.charts?.barChart}
                                    title="Age Buckets"
                                    description="Current intake age distribution"
                                    colorVar="var(--chart-3)"
                                    trendText="Up 12% vs last week"
                                    className="h-full"
                                />
                            </Card>

                            <Card className="col-span-1 md:col-span-1 2xl:hidden min-h-[380px] md:min-h-[380px]">
                                <StatusPie
                                    data={data?.charts?.pieChart || []}
                                    title="Cases by Status"
                                    description="Latest intake sessions"
                                />
                            </Card>
                        </>
                    )}
                </div>

                {/* ---------- TABLE + PIE ---------- */}
                <div className="grid gap-4
                        grid-cols-1
                        lg:grid-cols-6
                        xl:grid-cols-12">
                    {/* Table: full width → 4/6 → 8/12 */}
                    <div className="col-span-1 lg:col-span-6 xl:col-span-12 2xl:col-span-8">

                        {loader ? (

                            <Card className="min-h-[420px]">
                                <CardHeader>
                                    <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                                    ))}
                                </CardContent>
                            </Card>
                        ) : (

                            <Card className="min-h-[420px]">
                                <ActiveCasesCard data={data?.table || []} />
                            </Card>
                        )}
                    </div>

                    <div className="hidden 2xl:block 2xl:col-span-4">
                        {loader ? (
                            <Card className="min-h-[420px]">
                                <CardHeader>
                                    <CardTitle><Skeleton className="h-5 w-32" /></CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-72 w-full" />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="min-h-[420px]">
                                <StatusPie
                                    data={data?.charts?.pieChart || []}
                                    title="Cases by Status"
                                    description="Latest intake sessions"
                                />
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
