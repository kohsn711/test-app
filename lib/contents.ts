import 'server-only'
import { createClient } from '@/utils/supabase/server'

export type ContentStatus = 'draft' | 'published' | 'archived'

export type Audience = 'student' | 'parent' | 'coach'

export type AdminAudienceFilter = Audience | 'all'

export type AdminPublishedPeriod = 'all' | 'today' | 'week' | 'month'

export type AdminContentsQuery = {
  status: ContentStatus
  audience: AdminAudienceFilter
  period: AdminPublishedPeriod
  page: number
  limit: number
}

export type AdminContentsResult = {
  items: AdminContentListItem[]
  hasNext: boolean
}

export const CONTENT_STATUSES = [
  'draft',
  'published',
  'archived',
] as const satisfies readonly ContentStatus[]

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '下書き',
  published: '公開中',
  archived: 'アーカイブ',
}

export const ADMIN_AUDIENCE_LABEL: Record<AdminAudienceFilter, string> = {
  all: 'すべて',
  student: '学生',
  parent: '保護者',
  coach: '監督',
}

export const ADMIN_PUBLISHED_PERIOD_LABEL: Record<AdminPublishedPeriod, string> = {
  all: 'すべて',
  today: '今日',
  week: '今週',
  month: '今月',
}

export const CONTENT_CATEGORIES = [
  '練習',
  'トレーニング',
  '食事',
  'コンディション',
  'ケガ予防',
  '目標',
  '保護者向け',
  '指導者向け',
  'お知らせ',
] as const

const AUDIENCE_COLUMN = {
  student: 'for_student',
  parent: 'for_parent',
  coach: 'for_coach',
} as const satisfies Record<Audience, string>

export type ContentListItem = {
  id: string
  title: string
  thumbnailUrl: string | null
  category: string | null
  publishedAt: string | null
}

export type ContentDetail = ContentListItem & {
  body: string
  externalVideoUrl: string | null
  forStudent: boolean
  forParent: boolean
  forCoach: boolean
}

export type AdminContentListItem = ContentDetail & {
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type AdminContentDetail = AdminContentListItem & {
  createdBy: string
}

type AdminContentRow = {
  id: string
  title: string
  body: string
  thumbnail_url: string | null
  category: string | null
  external_video_url: string | null
  status: string
  published_at: string | null
  created_by: string
  created_at: string
  updated_at: string
  for_student: boolean
  for_parent: boolean
  for_coach: boolean
}

const mapAdminContentRow = (row: AdminContentRow): AdminContentDetail => ({
  id: row.id,
  title: row.title,
  body: row.body,
  thumbnailUrl: row.thumbnail_url,
  category: row.category,
  externalVideoUrl: row.external_video_url,
  status: row.status as ContentStatus,
  publishedAt: row.published_at,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  forStudent: row.for_student,
  forParent: row.for_parent,
  forCoach: row.for_coach,
})

export const fetchPublishedContents = async (
  audience: Audience,
  category?: string | null
): Promise<ContentListItem[]> => {
  const supabase = await createClient()
  let query = supabase
    .from('contents')
    .select('id, title, thumbnail_url, category, published_at')
    .eq('status', 'published')
    .eq(AUDIENCE_COLUMN[audience], true)
    .order('published_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data } = await query
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    category: row.category,
    publishedAt: row.published_at,
  }))
}

export const fetchPublishedCategories = async (
  audience: Audience
): Promise<string[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contents')
    .select('category')
    .eq('status', 'published')
    .eq(AUDIENCE_COLUMN[audience], true)
    .not('category', 'is', null)

  const set = new Set<string>()
  for (const row of data ?? []) {
    if (row.category) set.add(row.category)
  }
  return Array.from(set).sort()
}

export const fetchContentDetail = async (
  id: string,
  audience: Audience
): Promise<ContentDetail | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contents')
    .select(
      'id, title, body, thumbnail_url, category, published_at, external_video_url, for_student, for_parent, for_coach, status'
    )
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  if (data.status !== 'published') return null

  const audienceMatches = {
    student: data.for_student,
    parent: data.for_parent,
    coach: data.for_coach,
  }[audience]
  if (!audienceMatches) return null

  return {
    id: data.id,
    title: data.title,
    body: data.body,
    thumbnailUrl: data.thumbnail_url,
    category: data.category,
    publishedAt: data.published_at,
    externalVideoUrl: data.external_video_url,
    forStudent: data.for_student,
    forParent: data.for_parent,
    forCoach: data.for_coach,
  }
}

const getJstPeriodStartIso = (period: AdminPublishedPeriod): string | null => {
  if (period === 'all') return null

  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const year = jst.getUTCFullYear()
  const month = jst.getUTCMonth()
  const day = jst.getUTCDate()
  const start = new Date(Date.UTC(year, month, day) - 9 * 60 * 60 * 1000)

  if (period === 'week') {
    const dayOfWeek = jst.getUTCDay()
    const daysSinceMonday = (dayOfWeek + 6) % 7
    start.setUTCDate(start.getUTCDate() - daysSinceMonday)
  }

  if (period === 'month') {
    start.setUTCDate(1)
  }

  return start.toISOString()
}

export const fetchAdminContents = async (
  options: AdminContentsQuery
): Promise<AdminContentsResult> => {
  const supabase = await createClient()
  const page = Math.max(1, options.page)
  const limit = Math.max(1, Math.min(50, options.limit))
  const from = (page - 1) * limit
  const to = from + limit

  let query = supabase
    .from('contents')
    .select(
      'id, title, body, thumbnail_url, category, external_video_url, status, published_at, created_by, created_at, updated_at, for_student, for_parent, for_coach'
    )
    .eq('status', options.status)

  if (options.audience !== 'all') {
    query = query.eq(AUDIENCE_COLUMN[options.audience], true)
  }

  const periodStart =
    options.status === 'published' ? getJstPeriodStartIso(options.period) : null
  if (periodStart) {
    query = query.gte('published_at', periodStart)
  }

  query =
    options.status === 'published'
      ? query.order('published_at', { ascending: false })
      : query.order('updated_at', { ascending: false })

  const { data } = await query.range(from, to)
  const rows = ((data ?? []) as AdminContentRow[]).map(mapAdminContentRow)

  return {
    items: rows.slice(0, limit),
    hasNext: rows.length > limit,
  }
}

export const fetchAdminContentById = async (
  id: string
): Promise<AdminContentDetail | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contents')
    .select(
      'id, title, body, thumbnail_url, category, external_video_url, status, published_at, created_by, created_at, updated_at, for_student, for_parent, for_coach'
    )
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  return mapAdminContentRow(data as AdminContentRow)
}

export const formatDateTime = (iso: string | null): string => {
  if (!iso) return '未設定'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '未設定'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).format(d)
}

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com']

export const toYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (YOUTUBE_HOSTS.includes(u.hostname)) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
      const m = u.pathname.match(/^\/(embed|shorts)\/([^/?]+)/)
      if (m) return `https://www.youtube.com/embed/${m[2]}`
    }
    return null
  } catch {
    return null
  }
}

export const formatPublishedDate = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(d)
}
