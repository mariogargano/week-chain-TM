import { createAgentUIStreamResponse, convertToModelMessages } from 'ai'
import { createAgent, AgentType, AGENT_CONFIGS } from '@/lib/agents'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, agentType, conversationId, channel } = await request.json()
    
    if (!agentType || !AGENT_CONFIGS[agentType as AgentType]) {
      return NextResponse.json(
        { error: 'Tipo de agente invalido' },
        { status: 400 }
      )
    }
    
    const agent = createAgent(agentType as AgentType)
    const supabase = await createClient()
    
    // Log conversation start
    if (conversationId) {
      await supabase.from('agent_conversations').upsert({
        id: conversationId,
        agent_type: agentType,
        channel: channel || 'web',
        last_message_at: new Date().toISOString(),
        message_count: messages.length
      })
    }
    
    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages
    })
  } catch (error) {
    console.error('[v0] Agent chat error:', error)
    return NextResponse.json(
      { error: 'Error al procesar mensaje' },
      { status: 500 }
    )
  }
}
