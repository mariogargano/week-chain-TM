# WEEK-CHAIN

WEEK-CHAIN is the REaaS (Real Estate as a Service) infrastructure behind the WEEK-WORLD ecosystem.  
It converts premium vacation inventory into standardized annual capacity (weeks) and operates it as a **digital right-to-use** product: the **Smart Vacational Certificate (SVC)**.

> IMPORTANT: SVCs are **not ownership**, **not equity**, and **not an investment product**.  
> WEEK-CHAIN does **not** promise ROI, yield, appreciation, or financial returns to end customers.

---

## What is an SVC (Smart Vacational Certificate)?

An SVC is a **personal, limited-term vacation right-to-use** that allows a holder to request and confirm 1 week/year (depending on the certificate rules) within a managed inventory network.

**SVC ≠ Timeshare ownership**
- No fractional ownership
- No real estate title transfer
- No “guaranteed unit/week” without confirmation
- No perpetual obligations

**Core properties (high level)**
- **Term:** up to **15 years** (configurable by product series/rules)
- **Usage:** typically **1 week per year**, subject to rules and availability
- **Booking flow:** **REQUEST → OFFER → CONFIRM**
- **Transferability:** allowed under policy + KYC (where applicable)

---

## How booking works (REQUEST → OFFER → CONFIRM)

WEEK-CHAIN is designed around a compliance-friendly, expectation-safe booking flow:

1. **REQUEST** — the holder requests destination + dates + capacity (PAX)
2. **OFFER** — the system returns concrete options based on availability and rules
3. **CONFIRM** — the holder confirms one offer; the week is locked and operational processes start

This flow is a key guardrail to avoid “guaranteed fixed-week/unit” behavior typical of traditional timeshare models.

---

## Trust & Compliance (design principles)

WEEK-CHAIN is built to operate **compliance-first** (jurisdiction-dependent), emphasizing auditability and consumer protection.

Typical components:
- **Consumer protection** alignment (e.g., PROFECO adhesion contract in Mexico)
- **Digital evidence & integrity** (e.g., NOM-151 compatible preservation where applicable)
- **Cryptographic integrity**: document hashes (e.g., SHA-256) + QR verification
- **KYC / KYB** for holders, agents, and counterparties (policy-based)

> We may implement or reference “blockchain” for verification/integrity and controlled transfer records, but this repository and product positioning must **never** imply an investment, token yield, or speculative asset.

---

## What WEEK-CHAIN is (and what it is not)

### ✅ It is
- An operating system for **vacation capacity** (weeks) across curated properties
- A platform that issues and manages **digital right-to-use certificates**
- A workflow + compliance layer to run booking and operations at scale

### ❌ It is not
- A real estate investment product
- A promise of financial returns
- A token sale
- A property ownership scheme
- A “guaranteed fixed week/unit” without confirmation

---

## Repository scope

This repository contains code and documentation related to:
- Certificate lifecycle (issuance, rules, status, verification metadata)
- Inventory/week capacity modeling (52 weeks, blackout/maintenance windows)
- Request/offers/confirmation engine
- Operational workflows & integrations (payments, notifications, audits)
- Compliance-related evidence trails (as configured)

> Legal documents, consumer terms, and jurisdiction-specific policies may live in separate repositories or internal systems.

---

## Terminology

- **REaaS**: Real Estate as a Service (access/usage as a service, not ownership)
- **SVC**: Smart Vacational Certificate (personal right-to-use)
- **Holder**: certificate holder
- **PAX**: capacity tier (2/4/6/8/10)
- **SPV**: Special Purpose Vehicle (used per property for risk isolation, when applicable)

---

## Security & responsible disclosure

If you find a security issue, do not open a public issue. Please contact: **security@week-chain.com** (or replace with your official channel).

---

## License

TBD (proprietary / source-available / MIT).  
If this is proprietary, make sure the LICENSE file and headers reflect it.

---

## Disclaimer

WEEK-CHAIN provides a managed vacation usage right through SVCs.  
SVCs are **not** securities, **not** investment contracts, and **not** real estate ownership instruments.  
Availability is managed through **REQUEST → OFFER → CONFIRM** under the applicable Terms and Rules.
