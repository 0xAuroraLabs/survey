"use client"

import { useEffect } from "react"
import { initMockData } from "@/lib/init-mock-data"

export function MockDataInitializer() {
  useEffect(() => {
    console.log("MockDataInitializer component mounted")
    initMockData()
  }, [])

  return null
}
