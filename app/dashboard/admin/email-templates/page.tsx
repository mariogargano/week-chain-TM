"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface EmailTemplate {
  id: string
  type: string
  name: string
  subject: string
  status: "draft" | "active" | "archived"
  is_active: boolean
  updated_at: string
  created_at: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "archived">("all")

  useEffect(() => {
    fetchTemplates()
  }, [filter])

  async function fetchTemplates() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.set("status", filter)
      }

      const response = await fetch(`/api/admin/email-templates?${params}`)
      const data = await response.json()

      if (data.templates) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error("[v0] Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error("[v0] Error deleting template:", error)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
              <p className="text-slate-600 mt-1">Manage email templates for automated communication</p>
            </div>
            <Link href="/dashboard/admin/email-templates/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
              Active
            </Button>
            <Button variant={filter === "draft" ? "default" : "outline"} onClick={() => setFilter("draft")}>
              Draft
            </Button>
            <Button variant={filter === "archived" ? "default" : "outline"} onClick={() => setFilter("archived")}>
              Archived
            </Button>
          </div>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                {templates.length} template{templates.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  No templates found. Create your first template to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              template.status === "active"
                                ? "default"
                                : template.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {template.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {template.is_active ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(template.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/admin/email-templates/${template.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/email-templates/${template.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Active Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{templates.filter((t) => t.status === "active").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Draft Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{templates.filter((t) => t.status === "draft").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Archived Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{templates.filter((t) => t.status === "archived").length}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
