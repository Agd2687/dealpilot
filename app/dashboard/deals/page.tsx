"use client"

import dynamic from "next/dynamic"

const DealsClient = dynamic(() => import("./DealsClient"), {
  ssr: false,
})

export default function Page() {
  return <DealsClient />
}