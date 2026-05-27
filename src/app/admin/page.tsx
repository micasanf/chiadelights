'use client'

import { useState } from 'react'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Admin Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ChiaDelights</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-1">Admin</span>
          </div>
          <Button href="/" asChild size="sm" variant="outline">
            <a href="/">
              <Leaf className="w-4 h-4 mr-1" /> Back to Store
            </a>
          </Button>
        </div>
      </nav>

      {/* ─── Admin Content ─── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage orders, view proofs, and generate reports</p>
        </div>
        <AdminDashboard />
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-emerald-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Leaf className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm">ChiaDelights Admin</span>
            </div>
            <p className="text-xs text-emerald-300">
              © {new Date().getFullYear()} ChiaDelights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
