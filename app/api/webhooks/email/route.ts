import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from 'ai';
import { AGENT_CONFIGS } from '@/lib/agents';

// This handles incoming emails via SendGrid Inbound Parse or similar
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const from = formData.get('from') as string
    const to = formData.get('to') as string
    const subject = formData.get('subject') as string
    const text = formData.get('text') as string
    const html = formData.get('html') as string
    
    if (!from || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Extract email address from "Name <email@domain.com>" format
    const emailMatch = from.match(/<(.+)>/) || [null, from]
    const senderEmail = emailMatch[1] || from
    
    const supabase = await createClient()
    
    // Determine agent type based on email address
    let agentType = 'support'
    if (to?.includes('ventas') || to?.includes('sales')) agentType = 'sales'
    if (to?.includes('legal') || to?.includes('compliance')) agentType = 'legal'
    if (to?.includes('marketing')) agentType = 'marketing'
    if (to?.includes('finanzas') || to?.includes('finance')) agentType = 'finance'
    
    // Get or create conversation
    let { data: conversation } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('channel', 'email')
      .eq('external_id', senderEmail)
      .single()
    
    if (!conversation) {
      const { data: newConv } = await supabase
        .from('agent_conversations')
        .insert({
          agent_type: agentType,
          channel: 'email',
          external_id: senderEmail,
          status: 'active',
          metadata: { subject }
        })
        .select()
        .single()
      conversation = newConv
    }
    
    // Store incoming email
    await supabase.from('agent_messages').insert({
      conversation_id: conversation?.id,
      role: 'user',
      content: text,
      metadata: { subject, html: html?.substring(0, 1000) }
    })
    
    // Get conversation history
    const { data: history } = await supabase
      .from('agent_messages')
      .select('role, content')
      .eq('conversation_id', conversation?.id)
      .order('created_at', { ascending: true })
      .limit(10)
    
    // Generate response
    const config = AGENT_CONFIGS[agentType as keyof typeof AGENT_CONFIGS]
    const messages = history?.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content
    })) || []
    
    const result = await generateText({
      model: config.model,
      system: config.instructions + '\n\nContexto: Estas respondiendo un email. Mantén un formato profesional de correo electronico.',
      messages
    })
    
    const responseText = result.text
    
    // Store response
    await supabase.from('agent_messages').insert({
      conversation_id: conversation?.id,
      role: 'assistant',
      content: responseText
    })
    
    // Create notification for supervision
    await supabase.from('agent_notifications').insert({
      type: 'email_response',
      agent_type: agentType,
      title: `Respuesta generada para: ${subject}`,
      message: `El agente ${config.name} genero una respuesta para ${senderEmail}`,
      metadata: {
        conversationId: conversation?.id,
        responsePreview: responseText.substring(0, 200)
      },
      requires_approval: true
    })
    
    // Note: Actual email sending would be done after supervisor approval
    // You would integrate with SendGrid, Resend, or similar here
    
    return NextResponse.json({ 
      status: 'processed',
      message: 'Email received and response generated. Pending supervisor approval.'
    })
  } catch (error) {
    console.error('[v0] Email webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
