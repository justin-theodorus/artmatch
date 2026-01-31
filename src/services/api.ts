import axios from 'axios'
import { Artwork, User, Gallery } from '../types'

const API_URL = process.env.EXPO_PUBLIC_API_URL 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const artworkAPI = {
  getArtworks: async (filters?: {
    style?: string
    min_price?: number
    max_price?: number
    medium?: string
    limit?: number
  }): Promise<Artwork[]> => {
    const response = await api.get('/artworks', { params: filters })
    return response.data
  },
  
  getArtwork: async (id: string): Promise<Artwork> => {
    const response = await api.get(`/artworks/${id}`)
    return response.data
  },
  
  recordSwipe: async (userId: string, artworkId: string, action: 'like' | 'pass'): Promise<void> => {
    await api.post('/artworks/swipe', {
      user_id: userId,
      artwork_id: artworkId,
      action
    })
  },
  
  getUserLikes: async (userId: string): Promise<Artwork[]> => {
    const response = await api.get(`/artworks/user/${userId}/likes`)
    return response.data
  }
}

export const recommendationAPI = {
  getRecommendations: async (userId: string, limit: number = 20, excludeIds?: string[]): Promise<Artwork[]> => {
    const response = await api.post('/recommendations', {
      user_id: userId,
      limit,
      exclude_ids: excludeIds
    })
    return response.data
  },
  
  getPopular: async (limit: number = 20): Promise<Artwork[]> => {
    const response = await api.get('/recommendations/popular', { params: { limit } })
    return response.data
  }
}

export const userAPI = {
  createUser: async (username: string, budgetMin: number = 0, budgetMax: number = 10000): Promise<User> => {
    const response = await api.post('/users', null, {
      params: { username, budget_min: budgetMin, budget_max: budgetMax }
    })
    return response.data
  },
  
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },
  
  updatePreferences: async (
    userId: string,
    preferences: { styles: Record<string, number>; budget_range: [number, number] },
    budgetMin?: number,
    budgetMax?: number
  ): Promise<void> => {
    await api.put(`/users/${userId}/preferences`, preferences, {
      params: { budget_min: budgetMin, budget_max: budgetMax }
    })
  }
}

export const galleryAPI = {
  getGalleries: async (): Promise<Gallery[]> => {
    const response = await api.get('/galleries')
    return response.data
  },

  getGallery: async (id: string): Promise<Gallery> => {
    const response = await api.get(`/galleries/${id}`)
    return response.data
  },

  getGalleryArtworks: async (id: string): Promise<Artwork[]> => {
    const response = await api.get(`/galleries/${id}/artworks`)
    return response.data
  },

  getRecommendedGalleries: async (userId: string): Promise<{
    has_enough_likes: boolean
    likes_count: number
    required_likes: number
    galleries: (Gallery & { recommendation_reason?: string })[]
  }> => {
    const response = await api.get(`/galleries/recommended/${userId}`)
    return response.data
  }
}

export const chatAPI = {
  sendMessage: async (
    userId: string,
    message: string,
    context?: { history: Array<{ role: string; content: string }> }
  ): Promise<{
    response: string
    artworks?: Artwork[]
    suggested_queries?: string[]
  }> => {
    const response = await api.post('/chat', {
      user_id: userId,
      message,
      context
    })
    return response.data
  }
}
