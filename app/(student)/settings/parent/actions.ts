'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export type InviteParentState = { error?: string; success?: string } | undefined

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const inviteParent = async (
  _prev: InviteParentState,
  formData: FormData
): Promise<InviteParentState> => {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return { error: 'メールアドレスの形式が正しくありません。' }
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  const userEmail = (claimsData?.claims?.email as string | undefined)?.toLowerCase()
  if (!userId) redirect('/login')

  if (userEmail && userEmail === email) {
    return { error: '自分以外のメールアドレスを入力してください。' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  if (profile?.role !== 'student') {
    return { error: '保護者を招待する権限がありません。' }
  }

  const { data: inviteKind, error: insertError } = await supabase.rpc('create_parent_invite', {
    _email: email,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'このメールアドレスはすでに招待済みです。' }
    }
    if (insertError.message.includes('email_already_used_by_non_parent')) {
      return { error: 'このメールアドレスは保護者アカウントとして利用できません。' }
    }
    if (insertError.message.includes('cannot_invite_self')) {
      return { error: '自分以外のメールアドレスを入力してください。' }
    }
    return { error: '招待の登録に失敗しました。時間をおいて再度お試しください。' }
  }

  if (inviteKind === 'new_parent') {
    // 初回のみ、保護者にOTPで本人確認してもらう（招待メール代わり）
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (otpError) {
      // 招待自体は登録済み。メール送信失敗だけログに残す扱いにする
      console.error('parent invite otp send failed', otpError)
    }

    revalidatePath('/settings/parent')
    return { success: '保護者へ初回設定用の認証コードを送信しました。' }
  }

  revalidatePath('/settings/parent')
  return { success: '保護者へ招待を追加しました。保護者はパスワードでログインして承認できます。' }
}

export const cancelParentInvite = async (formData: FormData): Promise<void> => {
  const linkId = String(formData.get('link_id') ?? '')
  if (!linkId) return

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect('/login')

  await supabase
    .from('parent_child_links')
    .delete()
    .eq('id', linkId)
    .eq('student_id', userId)

  revalidatePath('/settings/parent')
}

export const resendParentInviteCode = async (formData: FormData): Promise<void> => {
  const linkId = String(formData.get('link_id') ?? '')
  if (!linkId) return

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect('/login')

  const { data: link } = await supabase
    .from('parent_child_links')
    .select('invited_email')
    .eq('id', linkId)
    .eq('student_id', userId)
    .eq('status', 'pending')
    .is('parent_id', null)
    .maybeSingle()

  if (!link?.invited_email) return

  const { error } = await supabase.auth.signInWithOtp({
    email: link.invited_email,
    options: { shouldCreateUser: true },
  })
  if (error) {
    console.error('parent invite otp resend failed', error)
  }

  revalidatePath('/settings/parent')
}
