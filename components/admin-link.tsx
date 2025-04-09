"use client"

import type React from "react"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface AdminLinkProps {
  children: React.ReactNode
  className?: string
}

export function AdminLink({ children, className }: AdminLinkProps) {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <Link href="/dashboard/admin" className={className}>
      {children}
    </Link>
  )
}
