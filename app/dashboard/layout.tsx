"use client"

import Sidebar from "@/app/components/Sidebar"
import Topbar from "@/app/components/Topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-6 flex-1">
          {children}
        </main>

      </div>
    </div>
  )
}
