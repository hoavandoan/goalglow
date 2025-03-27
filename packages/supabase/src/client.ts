import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { config } from 'dotenv'

// Đọc biến môi trường từ file .env
config({
  path: '../../.env',
})

// Xác định các biến môi trường
let supabaseUrl: string = ''
let supabaseAnonKey: string = ''

try {
  // Thử đọc biến môi trường cho Next.js
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Nếu không có, thử đọc biến môi trường cho Expo
  if (!supabaseUrl) {
    supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
  }
  if (!supabaseAnonKey) {
    supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  }

  // Kiểm tra nếu không có biến môi trường
  if (!supabaseUrl) {
    throw new Error(
      'Supabase URL không tìm thấy. Hãy đảm bảo NEXT_PUBLIC_SUPABASE_URL hoặc EXPO_PUBLIC_SUPABASE_URL được cài đặt trong .env'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Supabase Anon Key không tìm thấy. Hãy đảm bảo NEXT_PUBLIC_SUPABASE_ANON_KEY hoặc EXPO_PUBLIC_SUPABASE_ANON_KEY được cài đặt trong .env'
    )
  }
} catch (error) {
  console.error('Lỗi khi truy cập biến môi trường:', error)
  throw error
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Export for convenience
export default supabase
