"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Vote, TrendingUp, CheckCircle, XCircle, Clock, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function DAOPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [users, setUsers] = useState<Map<string, any>>(new Map())
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: proposalsData } = await supabase
      .from("dao_proposals")
      .select("*")
      .order("created_at", { ascending: false })

    const proposerIds = proposalsData?.map((p) => p.proposer_id).filter(Boolean) || []
    const { data: usersData } =
      proposerIds.length > 0
        ? await supabase.from("users").select("id, email, full_name").in("id", proposerIds)
        : { data: [] }

    const usersMap = new Map(usersData?.map((u) => [u.id, u]) || [])

    const { data: votesData } = await supabase.from("dao_votes").select("*")

    setProposals(proposalsData || [])
    setUsers(usersMap)
    setVotes(votesData || [])
    setLoading(false)
  }

  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.description) {
      toast.error("Por favor completa todos los campos")
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Debes iniciar sesión para crear una propuesta")
      return
    }

    const { error } = await supabase.from("dao_proposals").insert({
      title: newProposal.title,
      description: newProposal.description,
      proposer_id: user.id,
      status: "active",
    })

    if (error) {
      console.error("[v0] Error creating proposal:", error)
      toast.error("Error al crear la propuesta")
      return
    }

    toast.success("Propuesta creada exitosamente")
    setDialogOpen(false)
    setNewProposal({ title: "", description: "" })
    fetchData()
  }

  const activeProposals = proposals.filter((p) => p.status === "active").length
  const passedProposals = proposals.filter((p) => p.status === "passed").length
  const totalVotes = votes.length

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">DAO Governance</h1>
          <p className="text-slate-600 mt-2">Gestión de propuestas y votaciones</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Propuesta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Propuesta DAO</DialogTitle>
              <DialogDescription>
                Crea una propuesta para que la comunidad vote sobre cambios en la plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Aumentar comisión de referidos a 5%"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe los detalles de tu propuesta..."
                  rows={5}
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProposal}>Crear Propuesta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Propuestas Activas</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{activeProposals}</div>
            <p className="text-xs text-slate-600 mt-1">En votación</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Aprobadas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{passedProposals}</div>
            <p className="text-xs text-slate-600 mt-1">Implementadas</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Votos</CardTitle>
            <Vote className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalVotes}</div>
            <p className="text-xs text-slate-600 mt-1">Emitidos</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Propuestas</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{proposals.length || 0}</div>
            <p className="text-xs text-slate-600 mt-1">Históricas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Propuestas DAO</CardTitle>
          <CardDescription>Propuestas para modificar parámetros del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const votesForProposal = votes.filter((v) => v.proposal_id === proposal.id) || []
              const votesFor = votesForProposal.filter((v) => v.support === true).length
              const votesAgainst = votesForProposal.filter((v) => v.support === false).length
              const totalVotesForProposal = votesFor + votesAgainst
              const approvalRate = totalVotesForProposal > 0 ? (votesFor / totalVotesForProposal) * 100 : 0

              const proposer = users.get(proposal.proposer_id)

              return (
                <div key={proposal.id} className="p-6 rounded-lg border bg-slate-50 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-800">{proposal.title}</h3>
                        <Badge
                          variant={
                            proposal.status === "active"
                              ? "default"
                              : proposal.status === "passed"
                                ? "default"
                                : "secondary"
                          }
                          className={
                            proposal.status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : proposal.status === "passed"
                                ? "bg-green-100 text-green-700"
                                : proposal.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                          }
                        >
                          {proposal.status === "active" && <Clock className="h-3 w-3 mr-1" />}
                          {proposal.status === "passed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {proposal.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-3">{proposal.description}</p>
                      <div className="text-sm text-slate-500">
                        Propuesto por {proposer?.full_name || "Usuario"} •{" "}
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progreso de votación</span>
                      <span className="font-semibold text-slate-800">
                        {votesFor} a favor / {votesAgainst} en contra ({approvalRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                  </div>

                  {proposal.status === "active" && (
                    <div className="flex gap-3 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Ver Detalles
                      </Button>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="h-4 w-4 mr-1" />A Favor
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        En Contra
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
