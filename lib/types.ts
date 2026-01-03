import type React from "react"

export interface Product {
  id: string
  name: string
  category: string
  description: string
  longDescription?: string
  imageUrl: string
  price?: string
  features?: string[]
  specifications?: { key: string; value: string }[]
  slug: string
  relatedProducts?: string[] // IDs of related products
  tags?: string[] // e.g., 'eco-friendly', 'best-seller'
}

export interface IndustrySolution {
  id: string
  name: string
  description: string
  longDescription?: string
  imageUrl: string
  slug: string
  challenges?: string[]
  solutions?: string[]
  featuredProducts?: Product[] // Inline or IDs
}

export interface Service {
  id: string
  name: string
  description: string
  longDescription: string
  icon?: React.ElementType // Lucide icon
  slug: string
  benefits?: string[]
  processSteps?: { title: string; description: string; icon?: React.ElementType }[]
  imageUrl?: string
}

export interface Resource {
  id: string
  title: string
  type: "guide" | "calculator" | "catalog" | "case-study"
  description: string
  longDescription?: string
  imageUrl?: string
  slug: string
  icon?: React.ElementType
  downloadUrl?: string // For catalog or guides
  author?: string
  datePublished?: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  imageUrl: string
  bio?: string
}

export interface PressRelease {
  id: string
  title: string
  date: string
  summary: string
  slug: string // Link to full release or external source
}
