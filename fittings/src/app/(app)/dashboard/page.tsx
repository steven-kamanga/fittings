"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CalendarCheck, Activity, Calendar, Target, User } from "lucide-react";
import Link from "next/link";
import GettingStartedMessage from "@/components/getting-started-message";
import axios from "axios";

interface DashboardStats {
  totalFittings: number;
  totalSwingAnalyses: number;
  upcomingFittings: number;
  upcomingSwingAnalyses: number;
}

export default function Page() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalFittings: 0,
    totalSwingAnalyses: 0,
    upcomingFittings: 0,
    upcomingSwingAnalyses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.accessToken) {
      if ((session?.user as any)?.role === "admin") {
        fetchAdminStats();
      } else {
        setIsLoading(false);
      }
    }
  }, [status, session]);

  const fetchAdminStats = async () => {
    try {
      const [fittingsRes, swingAnalysesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/fitting-requests`, {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
          params: { page: 1, limit: 1000 },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/swing-analysis`, {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
          params: { page: 1, limit: 1000 },
        }),
      ]);

      const fittings = fittingsRes.data.fittingRequests || [];
      const swingAnalyses = swingAnalysesRes.data.swingAnalyses || [];

      setStats({
        totalFittings: fittings.length,
        totalSwingAnalyses: swingAnalyses.length,
        upcomingFittings: fittings.filter(
          (f: any) => f.status === "scheduled" || f.status === "submitted"
        ).length,
        upcomingSwingAnalyses: swingAnalyses.filter(
          (s: any) => s.status === "scheduled" || s.status === "submitted"
        ).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className=""></div>;
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  // Consumer Dashboard
  if ((session?.user as any)?.role === "consumer") {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-4xl space-y-4">
          {/* Welcome Section */}
          <section className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back,{" "}
              <span className="text-yellow-600">
                {(session?.user as any)?.name?.split(" ")[0]}
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              Your personalized golf fitting experience starts here
            </p>
          </section>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-900" />
              <h2 className="text-lg font-semibold text-yellow-700">
                Getting Started
              </h2>
            </div>
            <div className="bg-yellow-50/50 p-4 rounded-lg">
              <GettingStartedMessage />
            </div>
          </section>
          {/* Quick Actions Grid */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2">
              {/* Schedule Fitting */}
              <Link
                href="/schedule-fitting/create"
                className="border-r border-b border-gray-200"
              >
                <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors group text-center">
                  <CalendarCheck className="h-6 w-6 text-gray-900 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Schedule Fitting
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Book club fitting
                  </p>
                </div>
              </Link>

              {/* Schedule Swing Analysis */}
              <Link
                href="/swing-analysis/create"
                className="border-b border-gray-200"
              >
                <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors group text-center">
                  <Activity className="h-6 w-6 text-gray-900 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Swing Analysis
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Analyze your swing
                  </p>
                </div>
              </Link>

              {/* View All Fittings */}
              <Link
                href="/schedule-fitting"
                className="border-r border-b border-gray-200"
              >
                <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors group text-center">
                  <Calendar className="h-6 w-6 text-gray-900 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">
                    View Fittings
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">All appointments</p>
                </div>
              </Link>

              {/* View All Swing Analyses */}
              <Link href="/swing-analysis" className="border-b border-gray-200">
                <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors group text-center">
                  <Activity className="h-6 w-6 text-gray-900 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">
                    View Analyses
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    All swing analyses
                  </p>
                </div>
              </Link>

              {/* Getting Started Guide */}
              <Link
                href="/getting-started"
                className="border-r border-gray-200"
              >
                <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors group text-center">
                  <Target className="h-6 w-6 text-gray-900 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Getting Started
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Learn more</p>
                </div>
              </Link>

              {/* Profile */}
              <Link href="#">
                <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors group text-center">
                  <User className="h-6 w-6 text-gray-900 mb-3" />
                  <h3 className="text-base font-semibold text-gray-900">
                    My Profile
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Edit profile</p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Admin Dashboard
  return (
    <main className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        {/* Welcome Section */}
        <section className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Manage appointments and oversee operations
          </p>
        </section>

        {/* Stats Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
          <div className="grid grid-cols-4">
            <div className="border-r border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">Total Fittings</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalFittings}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>

            <div className="border-r border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">Upcoming Fittings</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats.upcomingFittings}
              </p>
              <p className="text-xs text-gray-400 mt-1">Pending</p>
            </div>

            <div className="border-r border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">Total Analyses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalSwingAnalyses}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>

            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">Upcoming Analyses</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats.upcomingSwingAnalyses}
              </p>
              <p className="text-xs text-gray-400 mt-1">Pending</p>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Access</h2>

          <div className="grid grid-cols-2">
            {/* Manage Fittings */}
            <Link
              href="/schedule-fitting"
              className="border-r border-b border-gray-200"
            >
              <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors text-center">
                <CalendarCheck className="h-6 w-6 text-gray-900 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">
                  Manage Fittings
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  View & update requests
                </p>
              </div>
            </Link>

            {/* Manage Swing Analyses */}
            <Link href="/swing-analysis" className="border-b border-gray-200">
              <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors text-center">
                <Activity className="h-6 w-6 text-gray-900 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">
                  Manage Analyses
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  View & update requests
                </p>
              </div>
            </Link>

            {/* Customer Profiles */}
            <Link
              href="/customer-profiles"
              className="border-r border-gray-200"
            >
              <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors text-center">
                <User className="h-6 w-6 text-gray-900 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">
                  Customer Profiles
                </h3>
                <p className="text-sm text-gray-500 mt-1">View customers</p>
              </div>
            </Link>

            {/* Getting Started Management */}
            <Link href="/getting-started">
              <div className="flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors text-center">
                <Target className="h-6 w-6 text-gray-900 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">
                  Getting Started
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage welcome message
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
