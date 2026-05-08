'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type ParentSetupState = { error?: string } | undefined

export const completeParentSetup = async (
  _prev: ParentSetupState,
  formData: FormData
): Promise<ParentSetupState> => {
  const displayName = String(formData.get('display_name') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('password_confirm') ?? '')
  if (!displayName) return { error: 'お名前を入力してください。' }
  if (displayName.length > 50) return { error: 'お名前は50文字以内で入力してください。' }
  if (password.length < 8) return { error: 'パスワードは8文字以上で入力してください。' }
  if (password !== passwordConfirm) return { error: '確認用パスワードが一致しません。' }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  const userEmail = (claimsData?.claims?.email as string | undefined) ?? null
  if (!userId) redirect('/login')
  if (!userEmail) return { error: 'メールアドレスを確認できませんでした。再度ログインしてください。' }

  // 招待がない場合は parent ロールでの登録は許可しない
  const { data: invites } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('status', 'pending')
    .is('parent_id', null)
    .eq('invited_email', userEmail.toLowerCase())
    .limit(1)
  if (!invites || invites.length === 0) {
    return { error: '保護者の招待が見つかりませんでした。' }
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password })
  if (passwordError) {
    return { error: 'パスワードの設定に失敗しました。別のパスワードで再度お試しください。' }
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      role: 'parent',
      display_name: displayName,
    },
    { onConflict: 'id' }
  )

  if (error) {
    return { error: 'プロフィールの保存に失敗しました。時間をおいて再度お試しください。' }
  }

  redirect('/parent/links')
}
