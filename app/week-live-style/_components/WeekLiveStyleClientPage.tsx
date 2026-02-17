"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, Heart, Share2, ArrowRight, Sparkles, Palmtree, Home, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { useState } from "react"

const categories = [
  { name: "Todos", slug: "all", icon: Sparkles },
  { name: "Destinos", slug: "destinations", icon: Palmtree },
  { name: "Propiedades", slug: "properties", icon: Home },
  { name: "Experiencias", slug: "experiences", icon: Star },
]

const featuredPost = {
  id: 1,
  title: "Los 10 Destinos Vacacionales Más Exclusivos de México 2025",
  excerpt: "Descubre los lugares más codiciados para invertir en propiedades vacacionales este año",
  image: "/luxury-beach-villa-cancun.jpg",
  category: "Destinos",
  author: "María González",
  authorImage: "/placeholder.svg?height=40&width=40",
  date: "15 de Enero, 2025",
  readTime: "8 min lectura",
  likes: 342,
  slug: "destinos-exclusivos-mexico-2025",
}

const articles = [
  {
    id: 2,
    title: "Cómo Maximizar el Retorno de tu Inversión Vacacional",
    excerpt: "Estrategias comprobadas para aumentar tus ingresos por renta vacacional",
    image: "/modern-penthouse-monterrey.jpg",
    category: "Propiedades",
    author: "Carlos Ruiz",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "12 de Enero, 2025",
    readTime: "6 min lectura",
    likes: 189,
    slug: "maximizar-roi-vacacional",
  },
  {
    id: 3,
    title: "Valle de Bravo: El Nuevo Hotspot de las Semanas Vacacionales",
    excerpt: "Por qué este destino se está convirtiendo en el favorito de los inversores",
    image: "/cabin-valle-de-bravo.jpg",
    category: "Destinos",
    author: "Ana Martínez",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "10 de Enero, 2025",
    readTime: "5 min lectura",
    likes: 256,
    slug: "valle-de-bravo-hotspot",
  },
  {
    id: 4,
    title: "Tendencias de Diseño en Propiedades Vacacionales 2025",
    excerpt: "Los estilos arquitectónicos que están transformando el mercado",
    image: "/colonial-house-guanajuato.jpg",
    category: "Propiedades",
    author: "Roberto Silva",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "8 de Enero, 2025",
    readTime: "7 min lectura",
    likes: 198,
    slug: "tendencias-diseno-2025",
  },
  {
    id: 5,
    title: "Experiencias Únicas: Actividades que Tus Huéspedes Amarán",
    excerpt: "Ideas innovadoras para hacer memorables las estancias en tu propiedad",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    category: "Experiencias",
    author: "Laura Torres",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "5 de Enero, 2025",
    readTime: "6 min lectura",
    likes: 223,
    slug: "experiencias-unicas-huespedes",
  },
  {
    id: 6,
    title: "Sustentabilidad en Propiedades Vacacionales",
    excerpt: "Cómo implementar prácticas eco-friendly que aumentan el valor",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    category: "Propiedades",
    author: "Diego Méndez",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "3 de Enero, 2025",
    readTime: "9 min lectura",
    likes: 167,
    slug: "sustentabilidad-propiedades",
  },
]

export default function WeekLiveStyleClientPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((article) => article.category.toLowerCase() === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/20 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0">
            Blog de Lifestyle
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            WEEK Live In Style
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Historias inspiradoras, consejos de expertos y las últimas tendencias en el mundo de las propiedades
            vacacionales
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="px-4 mb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.slug}
                  variant={category.slug === "all" ? "default" : "outline"}
                  className={
                    category.slug === "all"
                      ? "bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white border-0"
                      : "border-slate-200 hover:bg-slate-50"
                  }
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="px-4 mb-20">
        <div className="container mx-auto max-w-6xl">
          <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full overflow-hidden">
                <Image
                  src={featuredPost.image || "/placeholder.svg"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r" />
                <Badge className="absolute top-4 left-4 bg-white/95 text-slate-900 border-0">
                  {featuredPost.category}
                </Badge>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-pink-50/50 to-white">
                <Badge className="mb-4 w-fit bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0">
                  ⭐ Destacado
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-[#FF9AA2] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 mb-6 text-lg leading-relaxed">{featuredPost.excerpt}</p>

                <div className="flex items-center gap-4 mb-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center text-white text-xs font-semibold">
                      {featuredPost.author[0]}
                    </div>
                    <span className="font-medium text-slate-700">{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/week-live-style/${featuredPost.slug}`}>
                    <Button className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white">
                      Leer Artículo
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-[#FF9AA2]">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-slate-500 ml-2">{featuredPost.likes} likes</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Últimos Artículos</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-white/95 text-slate-900 border-0 text-xs">
                    {article.category}
                  </Badge>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-[#FF9AA2] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm line-clamp-2 leading-relaxed">{article.excerpt}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center text-white text-[10px] font-semibold">
                        {article.author[0]}
                      </div>
                      <span className="font-medium text-slate-700">{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Link href={`/week-live-style/${article.slug}`}>
                      <Button variant="ghost" size="sm" className="text-[#FF9AA2] hover:text-[#FF8A92] px-0">
                        Leer más
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-slate-500">{article.likes}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#FF9AA2] text-[#FF9AA2] hover:bg-[#FF9AA2] hover:text-white bg-transparent"
            >
              Cargar Más Artículos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-pink-100/50 via-coral-100/30 to-pink-100/50">
        <div className="container mx-auto max-w-3xl text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#FF9AA2]" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Mantente Inspirado</h2>
          <p className="text-slate-600 mb-8 text-lg">
            Recibe los mejores artículos, consejos y tendencias directamente en tu bandeja cada semana
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 focus:border-[#FF9AA2] focus:outline-none"
            />
            <Button className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white rounded-full px-8">
              Suscribirse
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
