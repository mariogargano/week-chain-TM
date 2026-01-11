"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, CheckCircle, Clock } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"

interface Proposal {
  id: string
  title: string
  description: string
  proposer_id: string
  proposal_type: string
  status: string
  votes_for: number
  votes_against: number
  quorum_required: number
  end_date: string
  created_at: string
}

export default function DAODashboard() {
  return (
    <RoleGuard allowedRoles={["dao_member", "admin"]}>
      <DAODashboardContent />
    </RoleGuard>
  )
}

function DAODashboardContent() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState({
    activeProposals: 0,
    totalVotes: 0,
    passed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProposals()
  }, [])

  async function loadProposals() {
    const supabase = createClient()

    const { data, error } = await supabase.from("dao_proposals").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setProposals(data)

      const activeProposals = data.filter((p) => p.status === "active").length
      const totalVotes = data.reduce((sum, p) => sum + p.votes_for + p.votes_against, 0)
      const passed = data.filter((p) => p.status === "passed").length

      setStats({ activeProposals, totalVotes, passed })
    }

    setLoading(false)
  }

  async function vote(proposalId: string, support: boolean) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("dao_votes").insert({
      proposal_id: proposalId,
      voter_id: user.id,
      support,
      voting_power: 1,
    })

    loadProposals()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Activa
          </Badge>
        )
      case "passed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobada
          </Badge>
        )
      case "rejected":
        return <Badge className="bg-red-500">Rechazada</Badge>
      case "executed":
        return <Badge className="bg-purple-500">Ejecutada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Cargando propuestas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C7CEEA]/20 via-[#FFB7B2]/20 to-[#B5EAD7]/20 p-8">
      <Navbar />
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 text-balance">Dashboard DAO</h1>
          <p className="text-slate-700 mt-2 text-pretty">Gobernanza y votaciones de la comunidad</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Propuestas Activas</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeProposals}</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-100 rounded-xl">
                <Vote className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Votos</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalVotes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Aprobadas</p>
                <p className="text-3xl font-bold text-slate-900">{stats.passed}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 text-balance">Propuestas</h2>
            <Button className="bg-[#FF9AA2] hover:bg-[#FF9AA2]/90 focus-visible:ring-2 focus-visible:ring-[#FF9AA2] focus-visible:ring-offset-2">
              Nueva Propuesta
            </Button>
          </div>

          <div className="space-y-4">
            {proposals.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No hay propuestas activas</p>
            ) : (
              proposals.map((proposal) => {
                const totalVotes = proposal.votes_for + proposal.votes_against
                const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0

                return (
                  <div
                    key={proposal.id}
                    className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 text-balance">{proposal.title}</h3>
                          {getStatusBadge(proposal.status)}
                        </div>
                        <p className="text-sm text-slate-600 mb-4 text-pretty">{proposal.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">A favor: {proposal.votes_for}</span>
                            <span className="text-slate-600">En contra: {proposal.votes_against}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${forPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500">Quórum requerido: {proposal.quorum_required} votos</p>
                        </div>
                      </div>
                    </div>

                    {proposal.status === "active" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => vote(proposal.id, true)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        >
                          Votar a Favor
                        </Button>
                        <Button
                          onClick={() => vote(proposal.id, false)}
                          size="sm"
                          variant="outline"
                          className="focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                        >
                          Votar en Contra
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
