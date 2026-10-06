"use client";
import {
  Upload,
  Crown,
  Menu,
  X,
  LayoutDashboard,
  HardDrive,
  CrownIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

export const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  const { user } = useUser();

  const getAllFiles = useQuery(api.fileStorage.getUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress as string,
  });

  const currentUser = useQuery(api.user.getUser, {
    email: user?.primaryEmailAddress?.emailAddress as string,
  });

  const progressValue =
    getAllFiles && getAllFiles.length ? (getAllFiles.length / 5) * 100 : 0;

  const navItemClass = (active: boolean) =>
    active
      ? "flex items-center gap-3 px-3 py-2.5 rounded-full w-full transition-all font-medium text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer"
      : "flex items-center gap-3 px-3 py-2.5 rounded-full text-slate-600 w-full hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium text-sm";

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-slate-200/80
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="h-16 flex items-center px-6 border-b border-slate-200/80 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Image src={"/logo.png"} width={20} height={20} alt="logo"/>
            <div className="leading-tight">
              <span className="text-lg font-semibold text-slate-900">कागज़</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-5.5">
          <button
            onClick={() => router.push("/dashboard")}
            className={navItemClass(path === "/dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <FileUpload>
            <Button
              disabled={
                getAllFiles?.length === 5 && currentUser?.upgrade === false
              }
              className="flex items-center gap-3 px-3 py-2.5 rounded-full w-full text-white hover:from-slate-800 hover:to-slate-600 transition-all cursor-pointer font-medium text-sm shadow-sm hover:shadow"
            >
              <Upload size={18} />
              <span>Upload PDF</span>
            </Button>
          </FileUpload>

          <button
            onClick={() => router.push("/dashboard/upgrade")}
            className={navItemClass(path === "/dashboard/upgrade")}
          >
            <Crown size={18} className="text-amber-500" />
            <span>Upgrade</span>
            <span className="ml-auto text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full ring-1 ring-inset ring-amber-200/70">
              PRO
            </span>
          </button>
        </nav>

        {/* Progress Section */}
        {currentUser?.upgrade === false && (
          <div className="p-4 border-t border-slate-200/80 space-y-3">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <HardDrive size={14} className="text-slate-400" />
                  Storage
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {getAllFiles?.length}/5 PDFs
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-gray-600"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2.5">
                {5 - (getAllFiles?.length || 0)} upload
                {5 - (getAllFiles?.length || 0) !== 1 ? "s" : ""} remaining on
                free plan
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/upgrade")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 hover:bg-black cursor-pointer text-white text-sm font-semibold"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
