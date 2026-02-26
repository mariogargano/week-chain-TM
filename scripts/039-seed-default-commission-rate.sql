-- Add a default fallback commission rate
INSERT INTO commission_rates (certificate_tier, default_rate, description)
VALUES ('default', 0.08, 'Default fallback rate for unrecognized tiers')
ON CONFLICT (certificate_tier) DO NOTHING;
