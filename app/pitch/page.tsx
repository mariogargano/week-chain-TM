"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Rocket,
  Shield,
  BarChart3,
  Globe,
  Award,
  CheckCircle2,
} from "lucide-react"

const slides = [
  {
    id: 1,
    title: "WEEK-CHAIN",
    subtitle: "Democratizando la Propiedad Vacacional a través de Blockchain",
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            WEEK-CHAIN
          </h1>
          <p className="text-2xl text-muted-foreground">Semanas Vacacionales Tokenizadas en Solana</p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">$97B</div>
              <div className="text-sm text-muted-foreground">Tamaño de Mercado</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">52</div>
              <div className="text-sm text-muted-foreground">Semanas/Propiedad</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">100%</div>
              <div className="text-sm text-muted-foreground">Líquido</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "El Problema",
    subtitle: "El Timeshare Tradicional está Roto",
    icon: Target,
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <h3 className="text-xl font-semibold mb-4 text-red-400">Problemas del Timeshare Tradicional</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Cero liquidez - imposible de vender</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Altas cuotas de mantenimiento para siempre</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Flexibilidad limitada en fechas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Estructura de propiedad opaca</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Tácticas de venta agresivas</span>
            </li>
          </ul>
        </Card>
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Desafíos de Rentas Vacacionales</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✗</span>
              <span>Costoso para propiedades premium</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✗</span>
              <span>Sin propiedad ni construcción de equity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✗</span>
              <span>Calidad inconsistente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✗</span>
              <span>Volatilidad de precios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✗</span>
              <span>Sin disponibilidad garantizada</span>
            </li>
          </ul>
        </Card>
      </div>
    ),
  },
  {
    id: 3,
    title: "Nuestra Solución",
    subtitle: "Propiedad Fraccionada con Blockchain",
    icon: Rocket,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="text-lg font-semibold mb-2">Semanas Tokenizadas</h3>
            <p className="text-sm text-muted-foreground">
              Cada propiedad dividida en 52 NFTs que representan una semana de propiedad
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="text-3xl mb-3">💧</div>
            <h3 className="text-lg font-semibold mb-2">Liquidez Instantánea</h3>
            <p className="text-sm text-muted-foreground">
              Compra, vende o intercambia tus semanas en nuestro marketplace en cualquier momento
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-red-500/10 border-pink-500/20 opacity-60">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Utilidad VA-FI™ (Próximamente)</h3>
            <p className="text-sm text-muted-foreground">
              El módulo VA-FI™ no está habilitado actualmente. Esta funcionalidad estará disponible próximamente.
            </p>
          </Card>
        </div>
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <h3 className="text-xl font-semibold mb-4">Modelo de Precios Estacional</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">2.0x</div>
              <div className="text-sm text-muted-foreground">Ultra Alta</div>
              <div className="text-xs text-muted-foreground">Navidad, Nochevieja</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">1.5x</div>
              <div className="text-sm text-muted-foreground">Temporada Alta</div>
              <div className="text-xs text-muted-foreground">Verano, Semana Santa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1.0x</div>
              <div className="text-sm text-muted-foreground">Temporada Media</div>
              <div className="text-xs text-muted-foreground">Primavera, Otoño</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0.7x</div>
              <div className="text-sm text-muted-foreground">Temporada Baja</div>
              <div className="text-xs text-muted-foreground">Fuera de temporada</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 4,
    title: "Oportunidad de Mercado",
    subtitle: "Mercado Masivo Abordable",
    icon: TrendingUp,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-blue-500/10 border-blue-500/20">
            <div className="text-4xl font-bold text-blue-400 mb-2">$10B</div>
            <div className="text-sm text-muted-foreground">Mercado Global de Timeshare</div>
          </Card>
          <Card className="p-6 text-center bg-purple-500/10 border-purple-500/20">
            <div className="text-4xl font-bold text-purple-400 mb-2">$87B</div>
            <div className="text-sm text-muted-foreground">Mercado de Rentas Vacacionales</div>
          </Card>
          <Card className="p-6 text-center bg-green-500/10 border-green-500/20">
            <div className="text-4xl font-bold text-green-400 mb-2">$97B</div>
            <div className="text-sm text-muted-foreground">Mercado Total Abordable</div>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Segmentos Objetivo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-semibold">Usuarios Nativos de Cripto</div>
                <div className="text-sm text-muted-foreground">
                  Primeros adoptantes que buscan utilidad en el mundo real
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">30%</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-semibold">Compradores de Propiedades Vacacionales</div>
                <div className="text-sm text-muted-foreground">Buscando propiedad fraccionada</div>
              </div>
              <div className="text-2xl font-bold text-purple-400">40%</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-semibold">Viajeros Frecuentes</div>
                <div className="text-sm text-muted-foreground">Buscando vacaciones de lujo rentables</div>
              </div>
              <div className="text-2xl font-bold text-green-400">30%</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 5,
    title: "Modelo de Negocio",
    subtitle: "Múltiples Flujos de Ingresos",
    icon: DollarSign,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Ingresos Primarios
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Comisión del Marketplace</span>
                <span className="font-bold text-blue-400">3-5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Venta Inicial de Tokens</span>
                <span className="font-bold text-blue-400">100%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Cuotas de Gestión</span>
                <span className="font-bold text-blue-400">15-20%</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Ingresos Secundarios
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Intereses VA-FI</span>
                <span className="font-bold text-purple-400">2-5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Comisiones de Corretaje</span>
                <span className="font-bold text-purple-400">8%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span>Características Premium</span>
                <span className="font-bold text-purple-400">Variable</span>
              </div>
            </div>
          </Card>
        </div>
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <h3 className="text-xl font-semibold mb-4">Proyección de Ingresos (Año 1)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Q1</div>
              <div className="text-2xl font-bold text-green-400">$50K</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Q2</div>
              <div className="text-2xl font-bold text-green-400">$150K</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Q3</div>
              <div className="text-2xl font-bold text-green-400">$300K</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Q4</div>
              <div className="text-2xl font-bold text-green-400">$500K</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 6,
    title: "Ventaja Competitiva",
    subtitle: "Qué Nos Hace Diferentes",
    icon: Award,
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <h3 className="text-xl font-semibold mb-4">Nuestras Ventajas</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Verdadera Liquidez</div>
                <div className="text-sm text-muted-foreground">
                  Marketplace instantáneo vs 0% de liquidez en timeshare tradicional
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Innovación VA-FI</div>
                <div className="text-sm text-muted-foreground">
                  Primera plataforma en añadir utilidad DeFi a NFTs vacacionales
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Precios Estacionales</div>
                <div className="text-sm text-muted-foreground">Valor de mercado justo vs precios unitalla</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Gestión Integrada</div>
                <div className="text-sm text-muted-foreground">
                  Gestión de propiedades con un clic por WEEK Management
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Blockchain Transparente</div>
                <div className="text-sm text-muted-foreground">
                  Todas las transacciones on-chain, completamente auditables
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Custodia Segura</div>
                <div className="text-sm text-muted-foreground">
                  Fondos protegidos con custodia multi-firma en Solana
                </div>
              </div>
            </li>
          </ul>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <h3 className="text-xl font-semibold mb-4">Comparación con la Competencia</h3>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Timeshare Tradicional</div>
              <div className="flex gap-2 text-sm">
                <span className="text-red-400">✗ Sin liquidez</span>
                <span className="text-red-400">✗ Altas cuotas</span>
                <span className="text-red-400">✗ Opaco</span>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Pacaso / Ember</div>
              <div className="flex gap-2 text-sm">
                <span className="text-yellow-400">~ Liquidez limitada</span>
                <span className="text-red-400">✗ Sin DeFi</span>
                <span className="text-green-400">✓ Fraccionado</span>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Airbnb / Vrbo</div>
              <div className="flex gap-2 text-sm">
                <span className="text-red-400">✗ Sin propiedad</span>
                <span className="text-red-400">✗ Volatilidad de precios</span>
                <span className="text-green-400">✓ Flexible</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border-2 border-blue-500/50">
              <div className="font-semibold mb-2">WEEK-CHAIN</div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-400">✓ Liquidez total</span>
                <span className="text-green-400">✓ Utilidad VA-FI</span>
                <span className="text-green-400">✓ Transparente</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 7,
    title: "Tracción y Hitos",
    subtitle: "Progreso Actual",
    icon: BarChart3,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 text-center bg-blue-500/10">
            <div className="text-3xl font-bold text-blue-400 mb-2">MVP</div>
            <div className="text-sm text-muted-foreground">Plataforma Completa</div>
          </Card>
          <Card className="p-6 text-center bg-purple-500/10">
            <div className="text-3xl font-bold text-purple-400 mb-2">54</div>
            <div className="text-sm text-muted-foreground">Tablas de Base de Datos</div>
          </Card>
          <Card className="p-6 text-center bg-green-500/10">
            <div className="text-3xl font-bold text-green-400 mb-2">5</div>
            <div className="text-sm text-muted-foreground">Roles de Usuario</div>
          </Card>
          <Card className="p-6 text-center bg-orange-500/10">
            <div className="text-3xl font-bold text-orange-400 mb-2">Listo</div>
            <div className="text-sm text-muted-foreground">Para Lanzamiento</div>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Hoja de Ruta</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0 text-sm font-semibold text-green-400">Q1 2025</div>
              <div className="flex-1">
                <div className="font-semibold">Lanzamiento Beta</div>
                <div className="text-sm text-muted-foreground">1 propiedad piloto, 50 usuarios beta</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0 text-sm font-semibold text-blue-400">Q2 2025</div>
              <div className="flex-1">
                <div className="font-semibold">Lanzamiento Público</div>
                <div className="text-sm text-muted-foreground">5 propiedades, 500 usuarios, marketplace activo</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-blue-400" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0 text-sm font-semibold text-purple-400">Q3 2025</div>
              <div className="flex-1">
                <div className="font-semibold">Escalar y Expandir</div>
                <div className="text-sm text-muted-foreground">20 propiedades, 2,000 usuarios, lanzamiento VA-FI</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-purple-400" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0 text-sm font-semibold text-orange-400">Q4 2025</div>
              <div className="flex-1">
                <div className="font-semibold">Internacional</div>
                <div className="text-sm text-muted-foreground">50 propiedades, 5,000 usuarios, multi-país</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-orange-400" />
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 8,
    title: "Pila Tecnológica",
    subtitle: "Construido sobre Solana",
    icon: Shield,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <h3 className="text-lg font-semibold mb-4">Blockchain</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Red Solana</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Estándar NFT (Metaplex)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Contratos Inteligentes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Integración USDC</span>
              </li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <h3 className="text-lg font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Next.js 15</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>TypeScript</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Base de Datos Supabase</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Alojamiento Vercel</span>
              </li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <h3 className="text-lg font-semibold mb-4">Seguridad</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Integración KYC</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Custodia Multi-firma</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Geo-bloqueo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Listo para Auditoría</span>
              </li>
            </ul>
          </Card>
        </div>
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h3 className="text-xl font-semibold mb-4">¿Por qué Solana?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">$0.00025</div>
              <div className="text-sm text-muted-foreground">Costo de Transacción</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">400ms</div>
              <div className="text-sm text-muted-foreground">Tiempo de Bloque</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">65,000</div>
              <div className="text-sm text-muted-foreground">Capacidad TPS</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 9,
    title: "Estrategia de Salida al Mercado",
    subtitle: "Plan de Adquisición de Clientes",
    icon: Target,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <h3 className="text-lg font-semibold mb-4">Fase 1: Beta (Q1 2025)</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Beta solo por invitación con 50 usuarios nativos de cripto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>1 propiedad piloto en ubicación premium</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Recopilar feedback e iterar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Crear casos de estudio y testimonios</span>
              </li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <h3 className="text-lg font-semibold mb-4">Fase 2: Lanzamiento (Q2 2025)</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Lanzamiento público con 5 propiedades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Colaboraciones con influencers en el espacio cripto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Marketing de contenidos y SEO</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Activación del programa de referidos</span>
              </li>
            </ul>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Canales de Marketing</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Comunidades Cripto</div>
              <div className="text-sm text-muted-foreground">Twitter, Discord, Telegram</div>
              <div className="text-xs text-blue-400 mt-2">CAC: $50-100</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Foros de Bienes Raíces</div>
              <div className="text-sm text-muted-foreground">BiggerPockets, Reddit</div>
              <div className="text-xs text-purple-400 mt-2">CAC: $100-150</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Red de Referidos</div>
              <div className="text-sm text-muted-foreground">Referidos de usuarios y corredores</div>
              <div className="text-xs text-green-400 mt-2">CAC: $30-50</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <h3 className="text-xl font-semibold mb-4">Economía Unitaria</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">CAC</div>
              <div className="text-3xl font-bold text-blue-400">$150</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">LTV</div>
              <div className="text-3xl font-bold text-green-400">$2,000</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">LTV:CAC</div>
              <div className="text-3xl font-bold text-purple-400">13:1</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 10,
    title: "Proyecciones de Ingresos", // Changed from "Proyecciones Financieras"
    subtitle: "Pronóstico a 3 Años",
    icon: TrendingUp,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-blue-500/10">
            <div className="text-sm text-muted-foreground mb-2">Año 1 (2025)</div>
            <div className="text-4xl font-bold text-blue-400 mb-2">$1M</div>
            <div className="text-sm text-muted-foreground">Ingresos</div>
            <div className="text-xs text-muted-foreground mt-2">5 propiedades, 500 usuarios</div>
          </Card>
          <Card className="p-6 text-center bg-purple-500/10">
            <div className="text-sm text-muted-foreground mb-2">Año 2 (2026)</div>
            <div className="text-4xl font-bold text-purple-400 mb-2">$5M</div>
            <div className="text-sm text-muted-foreground">Ingresos</div>
            <div className="text-xs text-muted-foreground mt-2">25 propiedades, 3,000 usuarios</div>
          </Card>
          <Card className="p-6 text-center bg-green-500/10">
            <div className="text-sm text-muted-foreground mb-2">Año 3 (2027)</div>
            <div className="text-4xl font-bold text-green-400 mb-2">$15M</div>
            <div className="text-sm text-muted-foreground">Ingresos</div>
            <div className="text-xs text-muted-foreground mt-2">75 propiedades, 10,000 usuarios</div>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Desglose de Ingresos (Año 2)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <span>Comisiones del Marketplace</span>
              <span className="font-bold text-blue-400">$2.0M (40%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <span>Ventas Iniciales de Tokens</span>
              <span className="font-bold text-purple-400">$1.5M (30%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <span>Cuotas de Gestión</span>
              <span className="font-bold text-green-400">$1.0M (20%)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <span>VA-FI y Otros</span>
              <span className="font-bold text-orange-400">$0.5M (10%)</span>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h3 className="text-xl font-semibold mb-4">Camino a la Rentabilidad</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Q2 2025</div>
              <div className="text-xl font-bold text-red-400">-$200K</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Q4 2025</div>
              <div className="text-xl font-bold text-orange-400">-$50K</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Q2 2026</div>
              <div className="text-xl font-bold text-yellow-400">$0</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Q4 2026</div>
              <div className="text-xl font-bold text-green-400">+$500K</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 11,
    title: "El Equipo",
    subtitle: "Liderazgo Experimentado",
    icon: Users,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">👤</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Fundador y CEO</h3>
                <p className="text-sm text-muted-foreground mb-2">Experto en Blockchain + Bienes Raíces</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• 10+ años en desarrollo inmobiliario</li>
                  <li>• Adopción temprana de cripto (2017)</li>
                  <li>• Salidas anteriores en PropTech</li>
                </ul>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">CTO</h3>
                <p className="text-sm text-muted-foreground mb-2">Arquitecto Blockchain</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Contribuidor central de Solana</li>
                  <li>• Construyó 3 protocolos DeFi</li>
                  <li>• Experto en seguridad de contratos inteligentes</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Socios Estratégicos</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-semibold">WEEK Management</div>
              <div className="text-xs text-muted-foreground">Socio de Gestión de Propiedades</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold">Asesores Legales</div>
              <div className="text-xs text-muted-foreground">Derecho Cripto + Inmobiliario</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl mb-2">🏗️</div>
              <div className="font-semibold">Red de Desarrolladores</div>
              <div className="text-xs text-muted-foreground">Pipeline de Propiedades</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <h3 className="text-xl font-semibold mb-4">Consejo Asesor</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">👤</div>
              <div>
                <div className="font-semibold text-sm">Asesor Inmobiliario</div>
                <div className="text-xs text-muted-foreground">Ex VP en Marriott Vacations</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">👤</div>
              <div>
                <div className="font-semibold text-sm">Asesor DeFi</div>
                <div className="text-xs text-muted-foreground">Fundador de Protocolo DeFi Top 50</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 12,
    title: "Legal y Cumplimiento",
    subtitle: "Estrategia Regulatoria",
    icon: Shield,
    content: (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <h3 className="text-xl font-semibold mb-4">Marco de Cumplimiento</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Estructura de Token de Utilidad</div>
                <div className="text-sm text-muted-foreground">
                  Los NFTs representan derechos de uso, no valores financieros
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Geo-bloqueo EE. UU.</div>
                <div className="text-sm text-muted-foreground">
                  Evitar la jurisdicción de la SEC hasta claridad regulatoria
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Integración KYC/AML</div>
                <div className="text-sm text-muted-foreground">
                  Verificación completa de identidad para todos los usuarios
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Avisos Legales</div>
                <div className="text-sm text-muted-foreground">
                  Términos claros que enfatizan la utilidad sobre la adquisición especulativa
                </div>
              </div>
            </div>
          </div>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <h3 className="text-lg font-semibold mb-4">Mercados Objetivo (Fase 1)</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span>México - Cripto-amigable, centro turístico</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span>Portugal - Regulaciones cripto claras</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span>España - Fuerte mercado vacacional</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span>Costa Rica - Líder en adopción cripto</span>
              </li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <h3 className="text-lg font-semibold mb-4">Mitigación de Riesgos</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Asesoría legal en cada jurisdicción</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Auditorías de contratos inteligentes por CertiK</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Seguro para tenencias de propiedades</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Custodia segura para todas las transacciones</span>
              </li>
            </ul>
          </Card>
        </div>
        <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">Monitoreo Regulatorio</h3>
          <p className="text-sm text-muted-foreground">
            Monitorizamos activamente los desarrollos regulatorios en todos los mercados objetivo y mantenemos
            relaciones con expertos legales especializados en cripto + bienes raíces. Nuestra estructura está diseñada
            para adaptarse rápidamente a los cambios regulatorios.
          </p>
        </Card>
      </div>
    ),
  },
  {
    id: 13,
    title: "Uso de Fondos",
    subtitle: "Asignación de Capital",
    icon: DollarSign,
    content: (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Asignación de Ronda Semilla: $3M</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Adquisición y Tokenización de Propiedades</span>
                <span className="font-bold text-blue-400">$1.2M (40%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: "40%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tokenizar 10-15 propiedades, honorarios legales, due diligence
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Tecnología y Desarrollo</span>
                <span className="font-bold text-purple-400">$750K (25%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-400" style={{ width: "25%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contratos inteligentes, escalado de plataforma, auditorías de seguridad
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Marketing y Adquisición de Usuarios</span>
                <span className="font-bold text-green-400">$600K (20%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: "20%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contenido, influencers, publicidad pagada, construcción de comunidad
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Legal y Cumplimiento</span>
                <span className="font-bold text-orange-400">$300K (10%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-400" style={{ width: "10%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Asesoría legal, licencias, cumplimiento regulatorio</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Operaciones y Runway</span>
                <span className="font-bold text-pink-400">$150K (5%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-pink-400" style={{ width: "5%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Salarios del equipo, oficina, gastos operativos (18 meses)
              </p>
            </div>
          </div>
        </Card>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-blue-500/10">
            <div className="text-sm text-muted-foreground mb-2">Runway</div>
            <div className="text-4xl font-bold text-blue-400 mb-2">18</div>
            <div className="text-sm text-muted-foreground">Meses</div>
          </Card>
          <Card className="p-6 text-center bg-purple-500/10">
            <div className="text-sm text-muted-foreground mb-2">Propiedades</div>
            <div className="text-4xl font-bold text-purple-400 mb-2">15</div>
            <div className="text-sm text-muted-foreground">Tokenizadas</div>
          </Card>
          <Card className="p-6 text-center bg-green-500/10">
            <div className="text-sm text-muted-foreground mb-2">Usuarios Objetivo</div>
            <div className="text-4xl font-bold text-green-400 mb-2">2,000</div>
            <div className="text-sm text-muted-foreground">Para el Mes 18</div>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 14,
    title: "Términos de Financiamiento",
    subtitle: "Detalles Ronda Semilla",
    icon: DollarSign,
    content: (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h3 className="text-2xl font-semibold mb-6 text-center">Ronda Semilla</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Recaudando</div>
              <div className="text-4xl font-bold text-blue-400">$3M</div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Valoración</div>
              <div className="text-4xl font-bold text-purple-400">$20M</div>
            </div>
          </div>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Términos</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Equity Ofrecido</span>
                <span className="font-semibold">15%</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Instrumento</span>
                <span className="font-semibold">SAFE / Equity</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Aportación Mínima</span>
                <span className="font-semibold">$50K</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Derechos del Socio</span>
                <span className="font-semibold">Pro-rata</span>
              </li>
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Beneficios para Socios</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Asiento de observador en el consejo (socio principal)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Reportes mensuales detallados</span> {/* Changed from "Actualizaciones financieras mensuales" */}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Acceso prioritario a la preventa de tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Tokens WEEK con descuento (30%)</span>
              </li>
            </ul>
          </Card>
        </div>
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10">
          <h3 className="text-xl font-semibold mb-4">Escenarios de Salida</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Adquisición</div>
              <div className="text-sm text-muted-foreground">Objetivo: Año 3-5</div>
              <div className="text-lg font-bold text-green-400 mt-2">$100M+</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">Liquidez de Tokens</div>
              <div className="text-sm text-muted-foreground">Objetivo: Año 2</div>
              <div className="text-lg font-bold text-blue-400 mt-2">Salida Parcial</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-semibold mb-2">IPO / SPAC</div>
              <div className="text-sm text-muted-foreground">Objetivo: Año 5+</div>
              <div className="text-lg font-bold text-purple-400 mt-2">$500M+</div>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: 15,
    title: "Contacto y Próximos Pasos",
    subtitle: "Construyamos Juntos",
    icon: Rocket,
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Únete a Nosotros
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Estamos revolucionando la propiedad vacacional. Sé parte del futuro.
          </p>
        </div>
        <Card className="p-8 max-w-2xl w-full">
          <h3 className="text-2xl font-semibold mb-6 text-center">Próximos Pasos</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-400">1</span>
              </div>
              <div>
                <div className="font-semibold">Agenda una Demo</div>
                <div className="text-sm text-muted-foreground">Ve la plataforma en acción</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-400">2</span>
              </div>
              <div>
                <div className="font-semibold">Due Diligence</div>
                <div className="text-sm text-muted-foreground">Accede a la sala de datos e información</div>{" "}
                {/* Changed from "sala de datos y finanzas" */}
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-400">3</span>
              </div>
              <div>
                <div className="font-semibold">Compromiso de Financiamiento</div>
                <div className="text-sm text-muted-foreground">Únete a nuestra tabla de capitalización</div>
              </div>
            </div>
          </div>
        </Card>
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Contacto</div>
            <div className="text-lg font-semibold">partners@week-chain.com</div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
              Agenda Reunión
            </Button>
            <Button size="lg" variant="outline">
              Descarga Presentación (PDF)
            </Button>
          </div>
        </div>
      </div>
    ),
  },
]

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/">
                <Home className="w-5 h-5" />
              </a>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">WEEK-CHAIN Investor Deck</h1>
              <p className="text-sm text-muted-foreground">Seed Round - $3M Raise</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Slide Content */}
        <Card className="min-h-[600px] p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {Icon && <Icon className="w-6 h-6 text-primary" />}
              <h2 className="text-3xl font-bold">{slide.title}</h2>
            </div>
            <p className="text-lg text-muted-foreground">{slide.subtitle}</p>
          </div>
          <div className="mt-8">{slide.content}</div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button onClick={prevSlide} disabled={currentSlide === 0} variant="outline" size="lg">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Button onClick={nextSlide} disabled={currentSlide === slides.length - 1} size="lg">
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Keyboard Navigation Hint */}
        <div className="text-center mt-4 text-sm text-muted-foreground">Use arrow keys to navigate</div>
      </div>
    </div>
  )
}
