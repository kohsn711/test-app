'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPostLoginPath } from '@/lib/auth'

export type ActionState = { error?: string } | undefined

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const signInWithPassword = async (
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const email    = String(formData.get('email')    ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!isValidEmail(email)) {
    return { error: 'メールアドレスの形式が正しくありません。' }
  }
  if (!password) {
    return { error: 'パスワードを入力してください。' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'メールアドレスまたはパスワードが正しくありません。' }
  }

  const next = await getPostLoginPath()
  redirect(next)
}

export const signOut = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
