'use client';
import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Activity,
  Send,
  Bot,
  UserCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  TrendingUp,
  Shield,
  Megaphone,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Agent configurations matching the backend
const AGENTS = [
  { id: 'support', name: 'Sofia', role: 'Soporte', color: 'bg-cyan-500', icon: Users, description: 'Atencion al cliente' },
  { id: 'sales', name: 'Carlos', role: 'Ventas', color: 'bg-emerald-500', icon: TrendingUp, description: 'Pre-Holder y certificados' },
  { id: 'legal', name: 'Laura', role: 'Legal', color: 'bg-violet-500', icon: Shield, description: 'Compliance y revision' },
  { id: 'marketing', name: 'Marina', role: 'Marketing', color: 'bg-amber-500', icon: Megaphone, description: 'Contenido y campanas' },
  { id: 'finance', name: 'Fernando', role: 'Finanzas', color: 'bg-red-500', icon: DollarSign, description: 'Reportes y metricas' }
]

interface Notification {
  id: string
  type: string
  title: string
  message: string
  agent_type: string
  requires_approval: boolean
  status: string
  created_at: string
}

interface Conversation {
  id: string
  agent_type: string
  channel: string
  status: string
  message_count: number
  last_message_at: string
}

export default function VirtualOfficePage() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState({
    totalConversations: 0,
    pendingApprovals: 0,
    activeAgents: 5,
    todayMessages: 0
  })
  const [inputValue, setInputValue] = useState('')
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/agents/chat',
      body: { agentType: selectedAgent.id }
    })
  })
  
  const supabase = createClient()
  
  // Load data
  useEffect(() => {
    loadNotifications()
    loadConversations()
    loadStats()
    
    // Set up real-time subscriptions
    const notificationsChannel = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'agent_notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(notificationsChannel)
    }
  }, [])
  
  async function loadNotifications() {
    const { data } = await supabase
      .from('agent_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }
  
  async function loadConversations() {
    const { data } = await supabase
      .from('agent_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(50)
    if (data) setConversations(data)
  }
  
  async function loadStats() {
    const { count: convCount } = await supabase
      .from('agent_conversations')
      .select('*', { count: 'exact', head: true })
    
    const { count: pendingCount } = await supabase
      .from('agent_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('requires_approval', true)
      .eq('status', 'pending')
    
    const { count: todayCount } = await supabase
      .from('agent_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0])
    
    setStats({
      totalConversations: convCount || 0,
      pendingApprovals: pendingCount || 0,
      activeAgents: 5,
      todayMessages: todayCount || 0
    })
  }
  
  async function handleApprove(notificationId: string) {
    await supabase
      .from('agent_notifications')
      .update({ status: 'approved' })
      .eq('id', notificationId)
    loadNotifications()
    loadStats()
  }
  
  async function handleReject(notificationId: string) {
    await supabase
      .from('agent_notifications')
      .update({ status: 'rejected' })
      .eq('id', notificationId)
    loadNotifications()
    loadStats()
  }
  
  function handleSendMessage() {
    if (!inputValue.trim()) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }
  
  function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
    if (!msg.parts || !Array.isArray(msg.parts)) return ''
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Oficina Virtual</h1>
              <p className="text-sm text-slate-400">Panel de supervision de agentes IA</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { loadNotifications(); loadConversations(); loadStats() }}
              className="border-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
                <p className="text-xs text-slate-400">Conversaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                <p className="text-xs text-slate-400">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeAgents}</p>
                <p className="text-xs text-slate-400">Agentes Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayMessages}</p>
                <p className="text-xs text-slate-400">Mensajes Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="p-4">
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start overflow-x-auto">
            <TabsTrigger value="agents" className="data-[state=active]:bg-slate-800">
              <Bot className="w-4 h-4 mr-2" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-800">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
              {stats.pendingApprovals > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">{stats.pendingApprovals}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conversations" className="data-[state=active]:bg-slate-800">
              <MessageSquare className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>
          
          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            {/* Agent Selector */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedAgent.id === agent.id 
                      ? 'bg-slate-800 border-slate-600 ring-2 ring-offset-2 ring-offset-slate-950 ring-slate-600' :'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full ${agent.color} flex items-center justify-center mx-auto mb-2`}>
                    <agent.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.role}</p>
                </button>
              ))}
            </div>
            
            {/* Chat with Agent */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full ${selectedAgent.color} flex items-center justify-center`}>
                    <selectedAgent.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                    <p className="text-sm text-slate-400">{selectedAgent.description}</p>
                  </div>
                  <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                    En linea
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Inicia una conversacion con {selectedAgent.name}</p>
                        <p className="text-xs mt-1">Prueba: &quot;Hola&quot; o &quot;Que puedes hacer?&quot;</p>
                      </div>
                    )}
                    {messages.map((message, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role !== 'user' && (
                          <div className={`h-8 w-8 rounded-full ${selectedAgent.color} flex items-center justify-center flex-shrink-0`}>
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.role === 'user' ?'bg-sky-600 text-white' :'bg-slate-800 text-slate-100'
                          }`}
                        >
                          <p className="text-sm">{getUIMessageText(message)}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                    ))}
                    {status === 'streaming' && (
                      <div className="flex gap-3">
                        <div className={`h-8 w-8 rounded-full ${selectedAgent.color} flex items-center justify-center`}>
                          <Bot className="h-4 w-4 text-white animate-pulse" />
                        </div>
                        <div className="bg-slate-800 rounded-2xl px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Mensaje para ${selectedAgent.name}...`}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={status === 'streaming' || !inputValue.trim()}
                    className="bg-sky-600 hover:bg-sky-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-3">
            {notifications.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">No hay notificaciones</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notification.requires_approval ? 'bg-amber-500/20' : 'bg-slate-800'
                      }`}>
                        {notification.requires_approval ? (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        ) : (
                          <Bell className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge className={`text-xs ${
                            notification.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            notification.status === 'approved'? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          } border-0`}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.created_at).toLocaleString('es-MX')}
                        </div>
                      </div>
                      {notification.requires_approval && notification.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(notification.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(notification.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-3">
            {conversations.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">No hay conversaciones</p>
                </CardContent>
              </Card>
            ) : (
              conversations.map((conv) => {
                const agent = AGENTS.find(a => a.id === conv.agent_type) || AGENTS[0]
                return (
                  <Card key={conv.id} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${agent.color} flex items-center justify-center`}>
                          <agent.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{agent.name}</p>
                            <Badge className="bg-slate-800 text-slate-400 border-0 text-xs">
                              {conv.channel === 'whatsapp' && <Phone className="h-3 w-3 mr-1" />}
                              {conv.channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                              {conv.channel}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {conv.message_count} mensajes
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            conv.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          } border-0 text-xs`}>
                            {conv.status}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(conv.last_message_at).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
