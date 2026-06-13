# 🌍 WEEK-CHAIN - Live URLs

## 📱 Acceso a la Plataforma

### **Producción** (Principal)
🌐 **https://week-chain.com**

- Dashboard Usuario: https://week-chain.com/dashboard/member
- Dashboard Broker: https://week-chain.com/dashboard/broker
- Dashboard Admin: https://week-chain.com/dashboard/admin
- Health Check: https://week-chain.com/api/monitoring/health

### **Staging** (Pre-Producción)
🌐 **https://staging-week-chain.vercel.app**

- Dashboard Usuario: https://staging-week-chain.vercel.app/dashboard/member
- Dashboard Broker: https://staging-week-chain.vercel.app/dashboard/broker
- Health Check: https://staging-week-chain.vercel.app/api/monitoring/health

---

## 📊 Dashboards de Monitoreo

### **Error Tracking (Sentry)**
🔗 https://sentry.io/organizations/[org-slug]/issues/

**Funciones:**
- Monitoreo de errores en real-time
- Stack traces automáticos
- Alertas por error rate
- Release tracking

**Configuración:**
```env
SENTRY_DSN=https://[key]@sentry.io/[id]
```

### **Rate Limiting & Cache (Upstash Redis)**
🔗 https://console.upstash.com/redis

**Funciones:**
- Monitor de rate limit hits
- Analytics de cache
- Dashboard de latencia
- Alertas de limite excedido

**Configuración:**
```env
UPSTASH_REDIS_REST_URL=https://[region].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
```

### **Performance & Code Quality (SonarQube)**
🔗 https://sonarcloud.io/organizations/[org]/projects

**Funciones:**
- Code coverage tracking
- Code smells detection
- Technical debt analysis
- Security hotspots

**Configuración:**
```env
SOAR_TOKEN=[token]
```

### **CI/CD Pipelines (GitHub Actions)**
🔗 https://github.com/mariogargano/week-chain-TM/actions

**Workflows Activos:**
- ✅ `pre-deploy-checks.yml` - Runs on PR
- ✅ `production-deploy.yml` - Runs on main push
- ✅ `security-alerts.yml` - Runs every 4 hours
- ✅ `release.yml` - Runs on git tags

### **Deployment Management (Vercel)**
🔗 https://vercel.com/mariogargano/week-chain-TM

**Funciones:**
- Deployment history
- Performance analytics
- Environment variables
- Domain management

---

## 🔗 Recursos Externos Integrados

### **Autenticación**
- **Supabase Auth:** https://app.supabase.com/
- **Google OAuth:** Configurado en Supabase
- **2FA (TOTP):** Google Authenticator, Microsoft Authenticator

### **Pagos**
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Conekta Dashboard:** https://dashboard.conekta.io/ (si aplica)
- **Webhooks Monitoreados:** ✅ Stripe, Conekta

### **Email**
- **Resend Email Service:** https://resend.com/
- **Status:** https://status.resend.com/

### **Almacenamiento**
- **Vercel Blob:** Integrado en Vercel
- **Supabase Storage:** PostgreSQL backups

---

## 🧪 Testing & QA URLs

### **Load Testing (k6)**
```bash
# Ejecutar load test contra staging
k6 run scripts/test-load.ts --env BASE_URL=https://staging-week-chain.vercel.app
```

### **Health Check API**
```bash
# Verificar salud de la plataforma
curl https://week-chain.com/api/monitoring/health

# Respuesta:
{
  "database": true,
  "cache": true,
  "payments": true,
  "timestamp": "2026-06-13T17:00:00.000Z"
}
```

### **Performance Check (Lighthouse)**
```bash
# Local
pnpm lh:local

# Production
pnpm lh:prod

# Reporte HTML
pnpm lh:prod:html
```

---

## 📈 Métricas en Vivo

### **Error Rate**
- **Objetivo:** <0.5%
- **Checker:** Sentry dashboard
- **Alert Threshold:** >5%

### **API Latency (P95)**
- **Objetivo:** <1s
- **Checker:** Vercel analytics
- **Alert Threshold:** >3s

### **Payment Success Rate**
- **Objetivo:** >99%
- **Checker:** Stripe dashboard + Sentry
- **Alert Threshold:** <95%

### **Uptime**
- **Objetivo:** 99.9%
- **Checker:** https://status.week-chain.com (si aplica)
- **Monitor:** Uptime Robot, Pingdom

---

## 🚀 Deploy Flow

```
┌─────────────┐
│  Developer  │
│  Push Code  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│  GitHub Actions Trigger  │
│  (pre-deploy-checks.yml) │
└──────────────┬───────────┘
               │
       ┌───────┴────────┐
       │ Tests OK?      │
       └───────┬────────┘
               │ YES
               ▼
┌──────────────────────────┐
│  Merge to Main           │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Trigger Deploy Workflow │
│  (production-deploy.yml) │
└──────────┬───────────────┘
           │
    ┌──────┴───────┐
    │              │
    ▼              ▼
┌────────┐    ┌──────────┐
│Staging │    │Production│
│Deploy  │    │Deploy    │
└────────┘    └──────────┘
    │              │
    ▼              ▼
┌────────┐    ┌──────────┐
│Smoke   │    │ Health   │
│Tests   │    │ Check    │
└────────┘    └──────────┘
    │              │
    └──────┬───────┘
           ▼
  ┌──────────────┐
  │  Monitoring  │
  │   24/7       │
  └──────────────┘
```

---

## 🔐 Security & Compliance Status

### ✅ Implementado
- ✅ PCI-DSS (Payment Card Data)
- ✅ NOM-151 (Digital Documents)
- ✅ KYC/AML (Identity Verification)
- ✅ 2FA (Two-Factor Authentication)
- ✅ Rate Limiting (DDoS Protection)
- ✅ RLS (Row-Level Security)
- ✅ OWASP Top 10

### 🟡 En Progreso
- 🟡 CNBV Sandbox Regulatorio (Timeline: 2-3 meses)
- 🟡 PROFECO Contract Registration (Timeline: 1-2 meses)
- 🟡 NOM-029 Full Implementation (Timeline: 1 mes)

### 📋 Documentación
- 📄 `CI_PRODUCTION_CHECKLIST.md` - Pre-deploy checklist
- 📄 `COMPLIANCE_ROADMAP.md` - Legal timeline
- 📄 `INCIDENT_RESPONSE.md` - Crisis procedures
- 📄 `IMPLEMENTATION_GUIDE.md` - Setup instructions

---

## 📞 Support & Documentation

### **Internal Resources**
- GitHub Repo: https://github.com/mariogargano/week-chain-TM
- Wiki: https://github.com/mariogargano/week-chain-TM/wiki
- Issues: https://github.com/mariogargano/week-chain-TM/issues
- Discussions: https://github.com/mariogargano/week-chain-TM/discussions

### **External Documentation**
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Stripe API: https://stripe.com/docs/api
- Vercel Docs: https://vercel.com/docs

---

## 🎯 Quick Links

| Recurso | URL | Acceso |
|---------|-----|--------|
| Plataforma | https://week-chain.com | Público |
| Staging | https://staging-week-chain.vercel.app | Público |
| GitHub | https://github.com/mariogargano/week-chain-TM | Privado |
| Sentry | https://sentry.io/ | Privado |
| Upstash | https://console.upstash.com | Privado |
| Stripe | https://dashboard.stripe.com | Privado |
| Supabase | https://app.supabase.com | Privado |
| Vercel | https://vercel.com | Privado |

---

**Última Actualización:** 13 de Junio, 2026  
**Status:** ✅ LIVE & OPERATIONAL
