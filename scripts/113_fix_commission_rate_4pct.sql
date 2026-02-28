-- Fix commission rates to flat 4% per product rules
-- WEEK-CHAIN uses a single flat 4% referral commission, no multi-level tiers

-- Update all existing commission rates to 4%
UPDATE public.commission_rates 
SET default_rate = 0.04,
    updated_at = NOW()
WHERE default_rate != 0.04;

-- Ensure a default row exists
INSERT INTO public.commission_rates (certificate_tier, default_rate)
VALUES ('default', 0.04)
ON CONFLICT (certificate_tier) DO UPDATE SET default_rate = 0.04, updated_at = NOW();
