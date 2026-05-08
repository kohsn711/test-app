'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPostLoginPath } from '@/lib/auth'

export type ActionState =
  | { error?: string }
  | undefined

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

export const verifyInitialParentOtp = async (
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const email = String(formData.get('email') ?? '').trim()
  const token = String(formData.get('token') ?? '').trim()

  if (!isValidEmail(email)) {
    return { error: 'メールアドレスが不正です。' }
  }
  if (!token) {
    return { error: '認証コードを入力してください。' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })

  if (error) {
    return { error: '認証コードが正しくありません。コードを確認して再度お試しください。' }
  }

  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) {
    await supabase.auth.signOut()
    return { error: 'ログインに失敗しました。時間をおいて再度お試しください。' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  if (profile?.role) {
    await supabase.auth.signOut()
    return { error: '初回設定済みです。パスワードでログインしてください。' }
  }

  const { data: invites } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('status', 'pending')
    .is('parent_id', null)
    .eq('invited_email', email.toLowerCase())
    .limit(1)

  if (!invites || invites.length === 0) {
    await supabase.auth.signOut()
    return { error: '保護者の初回招待が見つかりませんでした。' }
  }

  redirect('/setup')
}

export const signOut = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
