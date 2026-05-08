const configuredSupabaseHost = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  try {
    return new URL(supabaseUrl).hostname
  } catch {
    return null
  }
})()

export const isSupportedImageUrl = (src: string | null | undefined): src is string => {
  if (!src) return false
  if (src.startsWith('/')) return true

  try {
    const url = new URL(src)
    if (url.protocol !== 'https:') return false
    if (
      configuredSupabaseHost &&
      url.hostname === configuredSupabaseHost &&
      url.pathname.startsWith('/storage/v1/object/public/')
    ) {
      return true
    }
    return url.hostname === 'i.ytimg.com' || url.hostname === 'img.youtube.com'
  } catch {
    return false
  }
}
