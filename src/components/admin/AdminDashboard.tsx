'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag,
  PhilippinePeso,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  MoreVertical,
  Search,
  FileText,
  Upload,
  Download,
  RefreshCw,
  Loader2,
  Package,
  Truck,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

// ─── Constants ──────────────────────────────────────────

const FLAVOR_NAMES: Record<string, string> = {
  vanilla: 'Classic Vanilla Bean',
  chocolate: 'Rich Chocolate',
  mango: 'Tropical Mango',
  matcha: 'Zen Matcha',
  strawberry: 'Strawberry Bliss',
  coconut: 'Island Coconut',
}

const PAYMENT_LABELS: Record<string, { label: string; icon: string }> = {
  gcash: { label: 'GCash', icon: '💚' },
  maya: { label: 'Maya', icon: '💜' },
  bank_transfer: { label: 'Bank Transfer', icon: '🏦' },
  cod: { label: 'Cash on Delivery', icon: '💵' },
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  preparing: { label: 'Preparing', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  ready: { label: 'Ready', className: 'bg-teal-100 text-teal-800 border-teal-200' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
}

type Order = {
  id: string
  customerName: string
  email: string | null
  phone: string
  address: string | null
  deliveryMethod: string
  flavor: string
  size: string
  quantity: number
  paymentMethod: string
  paymentProof?: string | null
  specialRequests: string | null
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
}

type Report = {
  id: string
  title: string
  type: string
  data: Record<string, unknown> | null
  dateRange: string | null
  createdAt: string
}

// ─── Component ──────────────────────────────────────────

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('dashboard')
  const perPage = 10

  // Dialogs
  const [viewProof, setViewProof] = useState<Order | null>(null)
  const [viewDetails, setViewDetails] = useState<Order | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Order | null>(null)
  const [updateStatus, setUpdateStatus] = useState<{ order: Order; newStatus: string } | null>(null)

  // Report upload
  const [reportTitle, setReportTitle] = useState('')
  const [reportType, setReportType] = useState('sales')
  const [reportDateRange, setReportDateRange] = useState('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [reportFilePreview, setReportFilePreview] = useState<string | null>(null)

  // Initialize database then fetch data
  const initDb = useCallback(async () => {
    try {
      await fetch('/api/init-db')
    } catch {
      // Ignore init-db errors, tables might already exist
    }
  }, [])

  // Fetch data
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        setError(null)
      } else {
        setError('Failed to fetch orders. Please try refreshing.')
      }
    } catch (e) {
      console.error('Fetch orders error:', e)
      setError('Network error. Please check your connection and try again.')
    }
  }, [])

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        setReports(data)
      }
    } catch (e) {
      console.error('Fetch reports error:', e)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await initDb()
      await fetchOrders()
      await fetchReports()
      setLoading(false)
    }
    init()
  }, [initDb, fetchOrders, fetchReports])

  // Auto-refresh orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  // Computed values
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.flavor.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredOrders.length / perPage)
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage)

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length

  // Actions
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdateStatus(null)
    await fetchOrders()
  }

  const handleDelete = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    await fetchOrders()
  }

  const handleGenerateReport = async (type: string) => {
    let title = ''
    let data = {}
    if (type === 'sales') {
      title = `Sales Report - ${new Date().toLocaleDateString()}`
      data = {
        totalOrders: orders.length,
        totalRevenue,
        byFlavor: orders.reduce<Record<string, number>>((acc, o) => {
          acc[o.flavor] = (acc[o.flavor] || 0) + o.totalAmount
          return acc
        }, {}),
        byPayment: orders.reduce<Record<string, number>>((acc, o) => {
          acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1
          return acc
        }, {}),
      }
    } else {
      title = `Orders Summary - ${new Date().toLocaleDateString()}`
      data = {
        totalOrders: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        preparing: orders.filter((o) => o.status === 'preparing').length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
      }
    }
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, data }),
    })
    await fetchReports()
  }

  const handleUploadReport = async () => {
    if (!reportTitle) return
    let fileData = null
    if (reportFile) {
      const reader = new FileReader()
      fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(reportFile)
      })
    }
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: reportTitle,
        type: reportType,
        data: fileData ? { fileName: reportFile?.name, fileData } : null,
        dateRange: reportDateRange || null,
      }),
    })
    setReportTitle('')
    setReportType('sales')
    setReportDateRange('')
    setReportFile(null)
    setReportFilePreview(null)
    await fetchReports()
  }

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Flavor', 'Size', 'Qty', 'Total', 'Payment', 'Status', 'Delivery', 'Date']
    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.phone,
      FLAVOR_NAMES[o.flavor] || o.flavor,
      o.size,
      o.quantity,
      o.totalAmount,
      PAYMENT_LABELS[o.paymentMethod]?.label || o.paymentMethod,
      o.status,
      o.deliveryMethod,
      new Date(o.createdAt).toLocaleString(),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chiadelights-orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReportFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setReportFilePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setReportFilePreview(null)
    }
  }

  // ─── Render ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchOrders(); fetchReports() }}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-1.5">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingBag className="w-4 h-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <FileText className="w-4 h-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5">
            <Upload className="w-4 h-4" /> Upload
          </TabsTrigger>
        </TabsList>

        {/* ─── Dashboard ─── */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <PhilippinePeso className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">{deliveredCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                          {o.customerName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{o.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {FLAVOR_NAMES[o.flavor] || o.flavor} × {o.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">₱{o.totalAmount}</p>
                        <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[o.status]?.className || ''}`}>
                          {STATUS_CONFIG[o.status]?.label || o.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Flavor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    orders.reduce<Record<string, number>>((acc, o) => {
                      acc[o.flavor] = (acc[o.flavor] || 0) + 1
                      return acc
                    }, {})
                  )
                    .sort(([, a], [, b]) => b - a)
                    .map(([flavor, count]) => (
                      <div key={flavor} className="flex items-center justify-between text-sm">
                        <span>{FLAVOR_NAMES[flavor] || flavor}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(count / orders.length) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    orders.reduce<Record<string, number>>((acc, o) => {
                      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1
                      return acc
                    }, {})
                  )
                    .sort(([, a], [, b]) => b - a)
                    .map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between text-sm">
                        <span>
                          {PAYMENT_LABELS[method]?.icon} {PAYMENT_LABELS[method]?.label || method}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(count / orders.length) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Orders ─── */}
        <TabsContent value="orders" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, flavor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { fetchOrders(); fetchReports() }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={exportCSV} className="gap-1.5">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead>Flavor</TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden md:table-cell">Proof</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">
                          {o.id.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="font-medium">{o.customerName}</TableCell>
                        <TableCell className="hidden md:table-cell">{o.phone}</TableCell>
                        <TableCell>{FLAVOR_NAMES[o.flavor] || o.flavor}</TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">{o.size}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell className="font-bold text-emerald-600">₱{o.totalAmount}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {o.paymentMethod !== 'cod' && o.paymentProof ? (
                            <button
                              onClick={() => setViewProof(o)}
                              className="relative group"
                            >
                              <img
                                src={o.paymentProof}
                                alt="Proof"
                                className="w-10 h-10 rounded-md object-cover border hover:ring-2 hover:ring-emerald-500 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </button>
                          ) : o.paymentMethod === 'cod' ? (
                            <span className="text-xs text-muted-foreground">COD</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {PAYMENT_LABELS[o.paymentMethod]?.icon}{' '}
                          {PAYMENT_LABELS[o.paymentMethod]?.label || o.paymentMethod}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[o.status]?.className || ''}`}>
                            {STATUS_CONFIG[o.status]?.label || o.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewDetails(o)}>
                                <Eye className="w-4 h-4" /> View Details
                              </DropdownMenuItem>
                              {o.paymentMethod !== 'cod' && (
                                <DropdownMenuItem onClick={() => setViewProof(o)}>
                                  <ImageIcon className="w-4 h-4" /> View Payment Proof
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Package className="w-4 h-4" /> Update Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                    <DropdownMenuItem
                                      key={key}
                                      onClick={() => setUpdateStatus({ order: o, newStatus: key })}
                                      disabled={o.status === key}
                                    >
                                      <Badge variant="outline" className={`text-xs ${val.className}`}>
                                        {val.label}
                                      </Badge>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteConfirm(o)}
                              >
                                <Trash2 className="w-4 h-4" /> Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredOrders.length)} of{' '}
                {filteredOrders.length} orders
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Reports ─── */}
        <TabsContent value="reports" className="space-y-4 mt-6">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" onClick={() => handleGenerateReport('sales')}>
              <BarChart3 className="w-4 h-4" /> Generate Sales Report
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => handleGenerateReport('summary')}>
              <ClipboardList className="w-4 h-4" /> Generate Orders Summary
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export All to CSV
            </Button>
          </div>

          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No reports generated yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click the buttons above to generate your first report</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((r) => (
                <Card key={r.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          r.type === 'sales' ? 'bg-emerald-100' : 'bg-blue-100'
                        }`}>
                          {r.type === 'sales' ? (
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{r.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={async () => {
                          await fetch(`/api/reports/${r.id}`, { method: 'DELETE' })
                          await fetchReports()
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {r.dateRange && (
                      <p className="text-xs text-muted-foreground mt-2">Range: {r.dateRange}</p>
                    )}
                    {r.data && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-xs font-mono max-h-24 overflow-y-auto">
                        {JSON.stringify(r.data, null, 2).slice(0, 200)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Upload ─── */}
        <TabsContent value="upload" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Report Sheet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Title *</Label>
                  <Input
                    placeholder="e.g. Weekly Sales Report"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="summary">Orders Summary</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Input
                    placeholder="e.g. Jan 1 - Jan 31, 2025"
                    value={reportDateRange}
                    onChange={(e) => setReportDateRange(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Upload File (CSV, Image, or Document)</Label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                  onClick={() => document.getElementById('report-file-input')?.click()}
                >
                  {reportFilePreview ? (
                    <div className="space-y-2">
                      <img src={reportFilePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      <p className="text-xs text-muted-foreground">{reportFile?.name}</p>
                    </div>
                  ) : reportFile ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{reportFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(reportFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload file</p>
                      <p className="text-xs text-muted-foreground">CSV, images, or documents up to 5MB</p>
                    </div>
                  )}
                </div>
                <input id="report-file-input" type="file" className="hidden" onChange={handleFileChange} accept=".csv,.xlsx,.xls,.png,.jpg,.jpeg,.pdf" />
              </div>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full"
                onClick={handleUploadReport}
                disabled={!reportTitle}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Payment Proof Dialog ─── */}
      <Dialog open={!!viewProof} onOpenChange={() => setViewProof(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" /> Payment Proof
            </DialogTitle>
            <DialogDescription>
              Payment screenshot for order {viewProof?.id.slice(0, 12)}...
            </DialogDescription>
          </DialogHeader>
          {viewProof && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{viewProof.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">
                    {PAYMENT_LABELS[viewProof.paymentMethod]?.icon}{' '}
                    {PAYMENT_LABELS[viewProof.paymentMethod]?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-emerald-600">₱{viewProof.totalAmount}</span>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden bg-black/5">
                <img
                  src={viewProof.paymentProof || ''}
                  alt="Payment proof"
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (!viewProof?.paymentProof) return
                    const a = document.createElement('a')
                    a.href = viewProof.paymentProof
                    a.download = `payment-proof-${viewProof.id.slice(0, 12)}.png`
                    a.click()
                  }}
                >
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Order Details Dialog ─── */}
      <Dialog open={!!viewDetails} onOpenChange={() => setViewDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{viewDetails?.id.slice(0, 12).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {viewDetails && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{viewDetails.customerName}</span>
                </div>
                {viewDetails.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{viewDetails.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{viewDetails.phone}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium capitalize flex items-center gap-1">
                    {viewDetails.deliveryMethod === 'delivery' ? (
                      <><Truck className="w-3 h-3" /> Delivery</>
                    ) : (
                      <><Package className="w-3 h-3" /> Pickup</>
                    )}
                  </span>
                </div>
                {viewDetails.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right max-w-[200px]">{viewDetails.address}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flavor</span>
                  <span className="font-medium">{FLAVOR_NAMES[viewDetails.flavor] || viewDetails.flavor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium capitalize">{viewDetails.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{viewDetails.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">
                    {PAYMENT_LABELS[viewDetails.paymentMethod]?.icon}{' '}
                    {PAYMENT_LABELS[viewDetails.paymentMethod]?.label}
                  </span>
                </div>
                {viewDetails.paymentMethod !== 'cod' && viewDetails.paymentProof && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground text-sm">Payment Proof</span>
                      <div className="mt-2 border rounded-lg overflow-hidden bg-black/5 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all" onClick={() => { setViewDetails(null); setTimeout(() => setViewProof(viewDetails), 200); }}>
                        <img
                          src={viewDetails.paymentProof}
                          alt="Payment proof"
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Click image to view full size</p>
                    </div>
                  </>
                )}
                {viewDetails.specialRequests && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Special Requests</span>
                      <p className="mt-1 text-sm bg-background p-2 rounded">{viewDetails.specialRequests}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-emerald-600 text-lg">₱{viewDetails.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={STATUS_CONFIG[viewDetails.status]?.className || ''}>
                    {STATUS_CONFIG[viewDetails.status]?.label || viewDetails.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {new Date(viewDetails.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetails(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Update Status Confirm ─── */}
      <Dialog open={!!updateStatus} onOpenChange={() => setUpdateStatus(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change status of order #{updateStatus?.order.id.slice(0, 12).toUpperCase()} to{' '}
              <span className="font-semibold">{updateStatus && STATUS_CONFIG[updateStatus.newStatus]?.label}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUpdateStatus(null)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => updateStatus && handleUpdateStatus(updateStatus.order.id, updateStatus.newStatus)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" /> Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #{deleteConfirm?.id.slice(0, 12).toUpperCase()}? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
