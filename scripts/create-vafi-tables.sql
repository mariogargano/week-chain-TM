-- Create VA-FI loans table
CREATE TABLE IF NOT EXISTS vafi_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES auth.users(id),
  nft_collateral_id UUID NOT NULL REFERENCES nft_mints(id),
  loan_amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'repaid', 'liquidated', 'defaulted')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  repaid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vafi_loans_borrower ON vafi_loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_vafi_loans_status ON vafi_loans(status);
CREATE INDEX IF NOT EXISTS idx_vafi_loans_nft ON vafi_loans(nft_collateral_id);

-- Enable RLS
ALTER TABLE vafi_loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own loans"
  ON vafi_loans FOR SELECT
  USING (auth.uid() = borrower_id);

CREATE POLICY "Users can create their own loans"
  ON vafi_loans FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Users can update their own loans"
  ON vafi_loans FOR UPDATE
  USING (auth.uid() = borrower_id);
