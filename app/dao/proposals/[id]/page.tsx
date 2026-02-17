import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react"
import Link from "next/link"

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch proposal
  const { data: proposal } = await supabase.from("dao_proposals").select("*").eq("id", params.id).single()

  if (!proposal) {
    notFound()
  }

  // Check if user has voted
  const { data: userVote } = await supabase
    .from("dao_votes")
    .select("*")
    .eq("proposal_id", params.id)
    .eq("voter_id", user.id)
    .single()

  async function vote(formData: FormData) {
    "use server"

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const support = formData.get("support") === "true"
    const votingPower = 1 // In real implementation, calculate based on certificates held

    // Record vote
    await supabase.from("dao_votes").insert({
      proposal_id: params.id,
      voter_id: user.id,
      support,
      voting_power: votingPower,
    })

    // Update proposal vote counts
    const field = support ? "votes_for" : "votes_against"
    await supabase.rpc("increment_vote", {
      proposal_id: params.id,
      field_name: field,
      increment_by: votingPower,
    })

    redirect(`/dao/proposals/${params.id}`)
  }

  const totalVotes = (proposal.votes_for || 0) + (proposal.votes_against || 0)
  const forPercentage = totalVotes > 0 ? ((proposal.votes_for || 0) / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? ((proposal.votes_against || 0) / totalVotes) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dao" className="inline-block mb-6">
          <Button variant="ghost">← Volver a Propuestas</Button>
        </Link>

        {/* Proposal Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
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
                  {proposal.status === "active"
                    ? "activa"
                    : proposal.status === "passed"
                      ? "aprobada"
                      : proposal.status === "rejected"
                        ? "rechazada"
                        : proposal.status}
                </Badge>
                <Badge variant="outline">{proposal.category}</Badge>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">{proposal.title}</CardTitle>
            <CardDescription className="text-base">
              Propuesta el {new Date(proposal.created_at).toLocaleDateString("es-ES")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{proposal.description}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resultados de Votación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vote Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />A Favor
                  </span>
                  <span className="text-sm font-medium">
                    {proposal.votes_for || 0} votos ({forPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${forPercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    En Contra
                  </span>
                  <span className="text-sm font-medium">
                    {proposal.votes_against || 0} votos ({againstPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all"
                    style={{ width: `${againstPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Finaliza</p>
                  <p className="font-medium">{new Date(proposal.end_date).toLocaleDateString("es-ES")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Quórum</p>
                  <p className="font-medium">{proposal.quorum_required}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Votos</p>
                  <p className="font-medium">{totalVotes}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {proposal.status === "active" && !userVote && (
          <Card>
            <CardHeader>
              <CardTitle>Emite tu Voto</CardTitle>
              <CardDescription>Tu poder de voto se basa en tus certificados WEEK</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={vote} className="flex gap-4">
                <Button
                  type="submit"
                  name="support"
                  value="true"
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  Votar a Favor
                </Button>
                <Button type="submit" name="support" value="false" size="lg" variant="destructive" className="flex-1">
                  <ThumbsDown className="mr-2 h-5 w-5" />
                  Votar en Contra
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {userVote && (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">
                Ya has votado {userVote.support ? "A FAVOR" : "EN CONTRA"} de esta propuesta
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
