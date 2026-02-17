import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function CreateProposalPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  async function createProposal(formData: FormData) {
    "use server"

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const duration = Number.parseInt(formData.get("duration") as string)
    const quorum = Number.parseInt(formData.get("quorum") as string)

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)

    await supabase.from("dao_proposals").insert({
      title,
      description,
      category,
      proposer_id: user.id,
      status: "active",
      end_date: endDate.toISOString(),
      quorum_required: quorum,
      votes_for: 0,
      votes_against: 0,
    })

    redirect("/dao")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Proposal</h1>
          <p className="text-muted-foreground">Submit a new proposal for the community to vote on</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
            <CardDescription>Provide clear and detailed information about your proposal</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProposal} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title</Label>
                <Input id="title" name="title" placeholder="e.g., Increase broker commission to 5%" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide a detailed explanation of your proposal..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="treasury">Treasury</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Voting Duration (days)</Label>
                  <Input id="duration" name="duration" type="number" min="1" max="30" defaultValue="7" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quorum">Quorum Required (%)</Label>
                <Input id="quorum" name="quorum" type="number" min="1" max="100" defaultValue="20" required />
                <p className="text-sm text-muted-foreground">
                  Minimum percentage of votes needed for the proposal to pass
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1">
                  Submit Proposal
                </Button>
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/dao">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
