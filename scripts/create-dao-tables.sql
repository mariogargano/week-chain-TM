-- Create DAO proposals table
CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('governance', 'treasury', 'platform', 'community', 'technical')),
  proposer_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'passed', 'rejected', 'executed')),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  quorum_required INTEGER NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DAO votes table
CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id),
  support BOOLEAN NOT NULL,
  voting_power INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX IF NOT EXISTS idx_dao_proposals_proposer ON dao_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_dao_votes_proposal ON dao_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_dao_votes_voter ON dao_votes(voter_id);

-- Enable RLS
ALTER TABLE dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "Anyone can view proposals"
  ON dao_proposals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create proposals"
  ON dao_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Proposers can update their own proposals"
  ON dao_proposals FOR UPDATE
  USING (auth.uid() = proposer_id);

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes"
  ON dao_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON dao_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- Function to increment vote counts
CREATE OR REPLACE FUNCTION increment_vote(
  proposal_id UUID,
  field_name TEXT,
  increment_by INTEGER
)
RETURNS void AS $$
BEGIN
  IF field_name = 'votes_for' THEN
    UPDATE dao_proposals 
    SET votes_for = votes_for + increment_by 
    WHERE id = proposal_id;
  ELSIF field_name = 'votes_against' THEN
    UPDATE dao_proposals 
    SET votes_against = votes_against + increment_by 
    WHERE id = proposal_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
