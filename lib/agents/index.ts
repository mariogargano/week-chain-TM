import { ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Agent Types
export type AgentType = 'support' | 'sales' | 'legal' | 'marketing' | 'finance'

export interface AgentConfig {
  id: AgentType
  name: string
  description: string
  avatar: string
  color: string
  model: string
  instructions: string
}

// Agent Configurations
export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  support: {
    id: 'support',
    name: 'Sofia - Soporte',
    description: 'Atencion al cliente y resolucion de dudas sobre certificados SVC',
    avatar: '/agents/sofia.jpg',
    color: '#06b6d4', // cyan
    model: 'openai/gpt-4o-mini',
    instructions: `Eres Sofia, agente de soporte al cliente de WEEK-CHAIN. Tu rol es:
- Responder dudas sobre Smart Vacational Certificates (SVC)
- Explicar el proceso REQUEST → OFFER → CONFIRM
- Aclarar que el SVC NO es propiedad, NO es inversion, NO garantiza destinos especificos
- Guiar usuarios en el uso de la plataforma
- Escalar a supervision humana casos complejos o quejas
- Siempre ser amable, profesional y clara
- Responder en espanol
- Si no sabes algo, indica que escalaras el caso a un supervisor`
  },
  sales: {
    id: 'sales',
    name: 'Carlos - Ventas',
    description: 'Asesoria comercial y programa Pre-Holder',
    avatar: '/agents/carlos.jpg',
    color: '#10b981', // emerald
    model: 'openai/gpt-4o-mini',
    instructions: `Eres Carlos, agente de ventas de WEEK-CHAIN. Tu rol es:
- Guiar prospectos interesados en el programa Pre-Holder ($100 USD deposito reembolsable)
- Explicar beneficios: 5% descuento, acceso prioritario, deposito aplicable a compra
- Presentar el catalogo de certificados SVC (desde $6,500 USD)
- NUNCA prometer rendimientos, ganancias o garantias de acceso
- Siempre mencionar que es un derecho de solicitud, sujeto a disponibilidad
- Responder en espanol con tono profesional pero cercano
- Capturar datos de contacto de prospectos interesados`
  },
  legal: {
    id: 'legal',
    name: 'Laura - Legal',
    description: 'Revision de compliance y textos legales',
    avatar: '/agents/laura.jpg',
    color: '#8b5cf6', // violet
    model: 'openai/gpt-4o',
    instructions: `Eres Laura, agente de compliance legal de WEEK-CHAIN. Tu rol es:
- Revisar textos para cumplimiento PROFECO y normativa mexicana
- Asegurar que NO se hagan claims de propiedad, inversion o rendimientos
- Verificar que siempre se mencione: sujeto a disponibilidad, NO garantizado
- Sugerir disclaimers y micro-disclaimers apropiados
- Revisar conformidad con NOM-151
- Alertar sobre riesgos legales potenciales
- Todas las revisiones requieren aprobacion de supervision antes de implementarse`
  },
  marketing: {
    id: 'marketing',
    name: 'Marina - Marketing',
    description: 'Generacion de contenido y comunicaciones',
    avatar: '/agents/marina.jpg',
    color: '#f59e0b', // amber
    model: 'openai/gpt-4o-mini',
    instructions: `Eres Marina, agente de marketing de WEEK-CHAIN. Tu rol es:
- Generar copy para redes sociales, emails y landing pages
- Crear contenido que sea premium, simple y confiable
- SIEMPRE incluir disclaimers apropiados en contenido promocional
- Mantener consistencia con el tono de marca: profesional, transparente, premium
- Generar ideas de campanas y comunicaciones
- Todo contenido debe pasar revision legal antes de publicarse
- Responder en espanol`
  },
  finance: {
    id: 'finance',
    name: 'Fernando - Finanzas',
    description: 'Analisis de metricas, pagos y comisiones',
    avatar: '/agents/fernando.jpg',
    color: '#ef4444', // red
    model: 'openai/gpt-4o',
    instructions: `Eres Fernando, agente de finanzas de WEEK-CHAIN. Tu rol es:
- Generar reportes de ventas, pagos y comisiones
- Analizar metricas de conversion Pre-Holder
- Calcular comisiones de WEEK-AGENTS (4% fijo)
- Monitorear estado de escrow y liberaciones
- Proyectar ingresos basado en datos historicos
- Alertar sobre anomalias en pagos o patrones sospechosos
- Todos los reportes financieros son confidenciales y solo para uso interno`
  }
}

// Common Tools for all agents
const commonTools = {
  escalateToHuman: tool({
    description: 'Escala la conversacion a supervision humana',
    inputSchema: z.object({
      reason: z.string().describe('Razon de la escalacion'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Prioridad'),
      summary: z.string().describe('Resumen de la conversacion')
    }),
    execute: async ({ reason, priority, summary }) => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('agent_escalations')
        .insert({
          reason,
          priority,
          summary,
          status: 'pending'
        })
        .select()
        .single()
      
      if (error) return { success: false, error: error.message }
      return { success: true, escalationId: data.id, message: 'Escalado a supervision humana' }
    }
  }),
  
  logActivity: tool({
    description: 'Registra actividad importante para supervision',
    inputSchema: z.object({
      activityType: z.string(),
      details: z.string()
    }),
    execute: async ({ activityType, details }) => {
      const supabase = await createClient()
      await supabase.from('agent_activities').insert({
        activity_type: activityType,
        details
      })
      return { logged: true }
    }
  })
}

// Support Agent Tools
const supportTools = {
  ...commonTools,
  searchFAQ: tool({
    description: 'Busca en la base de conocimientos de FAQs',
    inputSchema: z.object({
      query: z.string().describe('Termino de busqueda')
    }),
    execute: async ({ query }) => {
      // Predefined FAQs
      const faqs = [
        { q: 'que es svc', a: 'El Smart Vacational Certificate (SVC) es un derecho personal y temporal de solicitar uso vacacional por hasta 15 anos, sujeto a disponibilidad. NO es propiedad ni inversion.' },
        { q: 'como funciona', a: 'Funciona con el proceso REQUEST (solicitas) → OFFER (recibes oferta si hay disponibilidad) → CONFIRM (aceptas o declinas). No hay garantia de aprobacion.' },
        { q: 'reembolso', a: 'El deposito Pre-Holder de $100 USD es 100% reembolsable durante 2 meses si decides no continuar.' },
        { q: 'precio', a: 'Los certificados van desde $6,500 USD segun capacidad de personas y duracion.' }
      ]
      const matches = faqs.filter(f => f.q.includes(query.toLowerCase()) || query.toLowerCase().includes(f.q))
      return matches.length > 0 ? matches : [{ q: 'no encontrado', a: 'No encontre informacion especifica. Recomiendo escalar a un agente humano.' }]
    }
  }),
  getUserInfo: tool({
    description: 'Obtiene informacion del usuario por email',
    inputSchema: z.object({
      email: z.string().email()
    }),
    execute: async ({ email }) => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, holder_tier, kyc_status')
        .eq('email', email)
        .single()
      return data || { error: 'Usuario no encontrado' }
    }
  })
}

// Sales Agent Tools
const salesTools = {
  ...commonTools,
  captureLead: tool({
    description: 'Captura datos de un prospecto interesado',
    inputSchema: z.object({
      fullName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      interest: z.string().describe('Nivel de interes o producto de interes'),
      source: z.string().default('chat')
    }),
    execute: async ({ fullName, email, phone, interest, source }) => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('leads')
        .insert({
          full_name: fullName,
          email,
          phone,
          interest,
          source,
          status: 'new'
        })
        .select()
        .single()
      
      if (error) return { success: false, error: error.message }
      return { success: true, leadId: data.id, message: 'Prospecto registrado exitosamente' }
    }
  }),
  getCertificatePricing: tool({
    description: 'Obtiene precios del catalogo de certificados',
    inputSchema: z.object({
      pax: z.number().optional().describe('Numero de personas')
    }),
    execute: async ({ pax }) => {
      const catalog = [
        { pax: 2, weeks: 1, price: 6500, name: 'DUO-1' },
        { pax: 2, weeks: 2, price: 11000, name: 'DUO-2' },
        { pax: 4, weeks: 1, price: 9500, name: 'FAMILIA-1' },
        { pax: 4, weeks: 2, price: 16000, name: 'FAMILIA-2' },
        { pax: 6, weeks: 1, price: 14000, name: 'GRUPO-1' },
        { pax: 6, weeks: 2, price: 24000, name: 'GRUPO-2' },
        { pax: 8, weeks: 1, price: 20000, name: 'PREMIUM-1' },
        { pax: 8, weeks: 2, price: 35000, name: 'PREMIUM-2' }
      ]
      if (pax) return catalog.filter(c => c.pax === pax)
      return catalog
    }
  }),
  checkPreHolderStatus: tool({
    description: 'Verifica si un email ya es Pre-Holder',
    inputSchema: z.object({
      email: z.string().email()
    }),
    execute: async ({ email }) => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('pre_holders')
        .select('status, deposit_amount, created_at')
        .eq('email', email)
        .single()
      return data || { isPreHolder: false }
    }
  })
}

// Legal Agent Tools
const legalTools = {
  ...commonTools,
  reviewText: tool({
    description: 'Revisa un texto para compliance legal',
    inputSchema: z.object({
      text: z.string().describe('Texto a revisar'),
      context: z.string().describe('Contexto donde se usara el texto')
    }),
    execute: async ({ text, context }) => {
      // Flag problematic terms
      const redFlags = [
        { term: 'garantizado', suggestion: 'sujeto a disponibilidad' },
        { term: 'asegurado', suggestion: 'conforme a terminos' },
        { term: 'inversion', suggestion: 'derecho de uso' },
        { term: 'rendimiento', suggestion: 'beneficio del servicio' },
        { term: 'propiedad', suggestion: 'derecho personal de uso' },
        { term: 'siempre', suggestion: 'segun disponibilidad' }
      ]
      
      const issues = redFlags.filter(rf => text.toLowerCase().includes(rf.term))
      return {
        hasIssues: issues.length > 0,
        issues,
        recommendation: issues.length > 0 
          ? 'Se encontraron terminos que requieren revision antes de publicar' :'Texto parece cumplir con lineamientos basicos. Requiere aprobacion final de supervision.'
      }
    }
  }),
  getComplianceChecklist: tool({
    description: 'Obtiene checklist de compliance para un tipo de contenido',
    inputSchema: z.object({
      contentType: z.enum(['landing', 'email', 'social', 'contract', 'ad'])
    }),
    execute: async ({ contentType }) => {
      const checklists: Record<string, string[]> = {
        landing: [
          'Incluye disclaimer de que NO es propiedad inmobiliaria',
          'Menciona que esta sujeto a disponibilidad',
          'No promete destinos o fechas especificas',
          'Incluye link a terminos y condiciones',
          'Menciona proceso REQUEST → OFFER → CONFIRM'
        ],
        email: [
          'Incluye opcion de desuscripcion',
          'No hace claims de rendimientos',
          'Menciona que es un servicio, no inversion',
          'Incluye datos de contacto de la empresa'
        ],
        social: [
          'Micro-disclaimer visible',
          'No promete ganancias',
          'Hashtag #publicidad si es promocional',
          'Link a terminos completos'
        ],
        contract: [
          'Clausula de no transferibilidad',
          'Definicion clara de SVC',
          'Proceso de solicitud detallado',
          'Politica de cancelacion/reembolso',
          'Jurisdiccion y ley aplicable'
        ],
        ad: [
          'Disclaimer de servicio vacacional',
          'Precio visible con condiciones',
          'No promete acceso garantizado',
          'Cumple con Ley Federal de Proteccion al Consumidor'
        ]
      }
      return { checklist: checklists[contentType] || [] }
    }
  })
}

// Marketing Agent Tools
const marketingTools = {
  ...commonTools,
  generateCopy: tool({
    description: 'Genera copy para diferentes canales',
    inputSchema: z.object({
      type: z.enum(['social', 'email_subject', 'email_body', 'headline', 'cta']),
      topic: z.string(),
      tone: z.enum(['professional', 'casual', 'urgent', 'premium']).default('premium')
    }),
    execute: async ({ type, topic, tone }) => {
      return {
        generated: true,
        note: 'Copy generado. Requiere revision legal antes de publicar.',
        disclaimer: 'Sujeto a disponibilidad. Consulta terminos en week-chain.com/terms'
      }
    }
  }),
  getContentCalendar: tool({
    description: 'Obtiene el calendario de contenido pendiente',
    inputSchema: z.object({
      days: z.number().default(7)
    }),
    execute: async ({ days }) => {
      // This would fetch from a content calendar table
      return {
        pending: [
          { date: 'Lunes', type: 'social', status: 'pendiente' },
          { date: 'Miercoles', type: 'email', status: 'en revision legal' },
          { date: 'Viernes', type: 'blog', status: 'borrador' }
        ]
      }
    }
  })
}

// Finance Agent Tools
const financeTools = {
  ...commonTools,
  getRevenueReport: tool({
    description: 'Genera reporte de ingresos',
    inputSchema: z.object({
      period: z.enum(['today', 'week', 'month', 'quarter', 'year'])
    }),
    execute: async ({ period }) => {
      const supabase = await createClient()
      // This would aggregate from payments table
      const { data } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('status', 'completed')
        .limit(100)
      
      const total = data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      return {
        period,
        totalRevenue: total,
        transactions: data?.length || 0,
        currency: 'USD'
      }
    }
  }),
  getCommissionsReport: tool({
    description: 'Genera reporte de comisiones de agentes',
    inputSchema: z.object({
      agentId: z.string().optional()
    }),
    execute: async ({ agentId }) => {
      const supabase = await createClient()
      let query = supabase
        .from('broker_commissions')
        .select('broker_id, amount, status')
      
      if (agentId) query = query.eq('broker_id', agentId)
      
      const { data } = await query.limit(50)
      return {
        commissions: data || [],
        rate: '4%',
        note: 'Comision fija del 4% para todos los WEEK-AGENTS'
      }
    }
  }),
  getPreHolderMetrics: tool({
    description: 'Obtiene metricas del programa Pre-Holder',
    inputSchema: z.object({}),
    execute: async () => {
      const supabase = await createClient()
      const { data, count } = await supabase
        .from('pre_holders')
        .select('status', { count: 'exact' })
      
      const byStatus = data?.reduce((acc: Record<string, number>, ph) => {
        acc[ph.status] = (acc[ph.status] || 0) + 1
        return acc
      }, {}) || {}
      
      return {
        total: count || 0,
        byStatus,
        spotsRemaining: 500 - (count || 0),
        depositAmount: 100
      }
    }
  })
}

// Create Agent instances
export function createAgent(type: AgentType): ToolLoopAgent {
  const config = AGENT_CONFIGS[type]
  
  const toolSets: Record<AgentType, Record<string, ReturnType<typeof tool>>> = {
    support: supportTools,
    sales: salesTools,
    legal: legalTools,
    marketing: marketingTools,
    finance: financeTools
  }
  
  return new ToolLoopAgent({
    model: config.model,
    instructions: config.instructions,
    tools: toolSets[type]
  })
}

// Export all agents
export const agents = {
  support: () => createAgent('support'),
  sales: () => createAgent('sales'),
  legal: () => createAgent('legal'),
  marketing: () => createAgent('marketing'),
  finance: () => createAgent('finance')
}
