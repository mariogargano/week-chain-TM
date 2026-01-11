"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Eye, RefreshCw } from "lucide-react"

interface EmailLog {
  id: string
  template_type: string
  recipient_email: string
  subject: string
  sent_at: string
  opened_at: string | null
  clicked_at: string | null
  bounced: boolean
  failed: boolean
  error_message: string | null
  provider_message_id: string | null
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "sent" | "opened" | "failed">("all")

  useEffect(() => {
    fetchLogs()
  }, [filter])

  async function fetchLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === "failed") params.set("status", "failed")

      const response = await fetch(`/api/admin/email-logs?${params}`)
      const data = await response.json()

      if (data.logs) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("[v0] Error fetching email logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const openRate =
    logs.filter((l) => !l.failed).length > 0
      ? ((logs.filter((l) => l.opened_at).length / logs.filter((l) => !l.failed).length) * 100).toFixed(1)
      : "0.0"

  const clickRate =
    logs.filter((l) => !l.failed).length > 0
      ? ((logs.filter((l) => l.clicked_at).length / logs.filter((l) => !l.failed).length) * 100).toFixed(1)
      : "0.0"

  const bounceRate = logs.length > 0 ? ((logs.filter((l) => l.bounced).length / logs.length) * 100).toFixed(1) : "0.0"

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Email Logs</h1>
              <p className="text-slate-600 mt-1">Track email delivery, opens, clicks and bounces</p>
            </div>
            <Button onClick={fetchLogs} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{logs.filter((l) => !l.failed).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{openRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{clickRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{bounceRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              All ({logs.length})
            </Button>
            <Button variant={filter === "sent" ? "default" : "outline"} onClick={() => setFilter("sent")}>
              Sent ({logs.filter((l) => !l.failed).length})
            </Button>
            <Button variant={filter === "opened" ? "default" : "outline"} onClick={() => setFilter("opened")}>
              Opened ({logs.filter((l) => l.opened_at).length})
            </Button>
            <Button variant={filter === "failed" ? "default" : "outline"} onClick={() => setFilter("failed")}>
              Failed ({logs.filter((l) => l.failed).length})
            </Button>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Activity</CardTitle>
              <CardDescription>Recent email delivery logs with tracking metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>No email logs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.recipient_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.template_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(log.sent_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {log.failed ? (
                            <Badge variant="destructive">Failed</Badge>
                          ) : log.bounced ? (
                            <Badge variant="destructive">Bounced</Badge>
                          ) : (
                            <Badge variant="default">Sent</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {log.opened_at && <Badge variant="secondary">Opened</Badge>}
                            {log.clicked_at && <Badge variant="secondary">Clicked</Badge>}
                            {!log.opened_at && !log.clicked_at && !log.failed && (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
