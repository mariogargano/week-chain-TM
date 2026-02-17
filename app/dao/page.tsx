import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Vote, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default async function DAOPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch active proposals
  const { data: proposals } = await supabase
    .from("dao_proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch DAO stats
  const { data: stats } = await supabase.from("dao_proposals").select("status")

  const activeProposals = stats?.filter((s) => s.status === "active").length || 0
  const totalProposals = stats?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFB7B2]/20 via-[#FFDAC1]/20 to-[#C7CEEA]/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Gobernanza DAO</h1>
          <p className="text-slate-700">Participa en decisiones comunitarias y da forma al futuro de WEEK-CHAIN</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProposals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProposals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DAO Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treasury</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.5M</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Proposal Button */}
        <div className="mb-6">
          <Link href="/dao/create">
            <Button size="lg" className="bg-gradient-to-r from-[#C7CEEA] to-[#B5EAD7] text-slate-900 hover:opacity-90">
              Crear Nueva Propuesta
            </Button>
          </Link>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Active Proposals</h2>

          {proposals && proposals.length > 0 ? (
            proposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            proposal.status === "active"
                              ? "default"
                              : proposal.status === "passed"
                                ? "default"
                                : proposal.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                          }
                        >
                          {proposal.status}
                        </Badge>
                        <Badge variant="outline">{proposal.category}</Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Voting Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">For: {proposal.votes_for || 0}</span>
                        <span className="text-red-600">Against: {proposal.votes_against || 0}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${((proposal.votes_for || 0) / ((proposal.votes_for || 0) + (proposal.votes_against || 0) + 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Proposal Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Ends {new Date(proposal.end_date).toLocaleDateString()}
                        </span>
                        <span>Quorum: {proposal.quorum_required}%</span>
                      </div>
                      <Link href={`/dao/proposals/${proposal.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active proposals at the moment. Be the first to create one!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
