"use client";

import React from "react";
import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">
        Welcome to Dealpilot
      </h1>
      <Link 
      href="/dashboard"
       className="mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
        Get Started
      </Link>
    </main>
  );
} 