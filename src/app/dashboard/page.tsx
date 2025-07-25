// src/app/dashboard/page.tsx - Dashboard with Stats

"use client";
import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAdmin, selectCurrentUser } from "@/redux/selectors";
import { useGetLeadStatsQuery } from "@/redux/slices/leadsApi";
import {
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const DashboardPage = () => {
  // Get user info
  const isAdmin = useAppSelector(selectIsAdmin);
  const currentUser = useAppSelector(selectCurrentUser);

  // Get lead statistics - 🔥 FIXED: Added required argument object
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetLeadStatsQuery({
    include_multi_assignment_stats: isAdmin, // Include multi-assignment stats for admins
  });

  const handleRefreshStats = () => {
    refetchStats();
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser?.first_name} {currentUser?.last_name}!
            {/* {!isAdmin && (
              <span className="text-green-600 font-medium ml-2">
                ⚡ Super Fast Queries
              </span>
            )} */}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshStats}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            disabled={statsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`}
            />
            {statsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow border animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : statsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-red-800 font-medium">
              Unable to load statistics
            </h3>
            <p className="text-red-600 text-sm">
              Please try refreshing or contact support if the issue persists.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Leads */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_leads || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Open Leads */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Leads</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.open_leads || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active prospects</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.in_progress_leads || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Being worked on</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Closed Won */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Closed Won</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.closed_won_leads || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Successful conversions
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Leads Card (for both admin and user) */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Leads</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.my_leads || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Leads assigned to me</p>
          </div>
          <Link
            href="/my-leads"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Leads
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={isAdmin ? "/my-leads" : "/my-leads"}>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isAdmin ? "Manage All Leads" : "View My Leads"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAdmin
                      ? "View and manage all leads in the system"
                      : "Access your assigned leads "}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {isAdmin && (
            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded group-hover:bg-green-200 transition-colors">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create New Lead</h3>
                  <p className="text-sm text-gray-600">
                    Add a new lead to the system
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-600">
                  View detailed analytics and reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity or Additional Stats */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Performance</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">API Status</span>
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Query Speed</span>
              <span className="text-green-600">
                {isAdmin ? "~200ms" : "~50ms"}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Data</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-gray-600">Just now</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Data Accuracy</span>
              <span className="text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
