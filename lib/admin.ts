import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { roleHomePath } from '@/lib/role'

export const requireAdminUser = async (): Promise<string> => {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (!profile?.role) redirect('/setup')
  if (profile.role !== 'admin') redirect(roleHomePath(profile.role))

  return userId
}
