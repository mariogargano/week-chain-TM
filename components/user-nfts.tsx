"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { getSolanaConnection } from "@/lib/solana/config"
import { getWeekNFTData, type WeekNFTData } from "@/lib/solana/nft"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Home, ExternalLink } from "lucide-react"

interface UserNFTsProps {
  bookingIds: string[]
}

export function UserNFTs({ bookingIds }: UserNFTsProps) {
  const { publicKey } = useWallet()
  const [nfts, setNfts] = useState<WeekNFTData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNFTs() {
      if (!publicKey || bookingIds.length === 0) {
        setLoading(false)
        return
      }

      try {
        const connection = getSolanaConnection()
        const nftDataPromises = bookingIds.map((bookingId) => getWeekNFTData(connection, bookingId))
        const nftDataResults = await Promise.all(nftDataPromises)
        const validNfts = nftDataResults.filter((nft): nft is WeekNFTData => nft !== null)
        setNfts(validNfts)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [publicKey, bookingIds])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Week NFTs</CardTitle>
          <CardDescription>Loading your NFT collection...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Week NFTs</CardTitle>
          <CardDescription>You don't have any Week NFTs yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            NFTs are minted when your reservations are confirmed. Each NFT represents ownership of a specific week at a
            property.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Your Week NFTs</h2>
        <p className="text-muted-foreground">Your collection of property week ownership NFTs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nfts.map((nft) => (
          <Card key={nft.bookingId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Week {nft.weekNumber}</CardTitle>
                  <CardDescription>{nft.year}</CardDescription>
                </div>
                <Badge variant="secondary">NFT</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Property:</span>
                  <span className="text-muted-foreground">{nft.propertyId.slice(0, 8)}...</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Minted:</span>
                  <span className="text-muted-foreground">{new Date(nft.mintedAt * 1000).toLocaleDateString()}</span>
                </div>

                {nft.transferredAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Transferred:</span>
                    <span className="text-muted-foreground">
                      {new Date(nft.transferredAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <a
                      href={`https://explorer.solana.com/address/${nft.mint.toString()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Explorer
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
