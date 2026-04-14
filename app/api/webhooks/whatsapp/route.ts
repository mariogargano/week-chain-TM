import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from 'ai';
import { createAgent, AGENT_CONFIGS } from '@/lib/agents';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// Message handling (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract message data from WhatsApp webhook
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const message = changes?.value?.messages?.[0]
    
    if (!message) {
      return NextResponse.json({ status: 'no_message' })
    }
    
    const from = message.from // Phone number
    const text = message.text?.body || ''
    const messageId = message.id
    
    const supabase = await createClient()
    
    // Get or create conversation
    let { data: conversation } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('channel', 'whatsapp')
      .eq('external_id', from)
      .single()
    
    if (!conversation) {
      const { data: newConv } = await supabase
        .from('agent_conversations')
        .insert({
          agent_type: 'support', // Default to support agent
          channel: 'whatsapp',
          external_id: from,
          status: 'active'
        })
        .select()
        .single()
      conversation = newConv
    }
    
    // Store incoming message
    await supabase.from('agent_messages').insert({
      conversation_id: conversation?.id,
      role: 'user',
      content: text,
      external_id: messageId
    })
    
    // Get conversation history
    const { data: history } = await supabase
      .from('agent_messages')
      .select('role, content')
      .eq('conversation_id', conversation?.id)
      .order('created_at', { ascending: true })
      .limit(20)
    
    // Generate response using agent
    const agent = createAgent(conversation?.agent_type || 'support')
    const messages = history?.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content
    })) || []
    
    const result = await generateText({
      model: AGENT_CONFIGS[conversation?.agent_type || 'support'].model,
      system: AGENT_CONFIGS[conversation?.agent_type || 'support'].instructions,
      messages
    })
    
    const responseText = result.text
    
    // Store agent response
    await supabase.from('agent_messages').insert({
      conversation_id: conversation?.id,
      role: 'assistant',
      content: responseText
    })
    
    // Send WhatsApp reply
    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
      await fetch(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            type: 'text',
            text: { body: responseText }
          })
        }
      )
    }
    
    return NextResponse.json({ status: 'processed' })
  } catch (error) {
    console.error('[v0] WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
