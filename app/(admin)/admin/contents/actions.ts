'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminUser } from '@/lib/admin'
import {
  CONTENT_STATUSES,
  type ContentStatus,
} from '@/lib/contents'
import { isSupportedImageUrl } from '@/lib/image-url'
import { createClient } from '@/utils/supabase/server'

const THUMBNAIL_BUCKET = 'content-thumbnails'
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024

export type ContentFormValues = {
  title: string
  body: string
  thumbnailUrl: string
  category: string
  externalVideoUrl: string
  status: string
  forStudent: boolean
  forParent: boolean
  forCoach: boolean
}

export type ContentFormState =
  | { error?: string; values?: ContentFormValues }
  | undefined

const parseValues = (formData: FormData): ContentFormValues => ({
  title: String(formData.get('title') ?? '').trim(),
  body: String(formData.get('body') ?? '').trim(),
  thumbnailUrl: String(formData.get('thumbnail_url') ?? '').trim(),
  category: String(formData.get('category') ?? '').trim(),
  externalVideoUrl: String(formData.get('external_video_url') ?? '').trim(),
  status: String(formData.get('status') ?? '').trim(),
  forStudent: formData.get('for_student') === 'on',
  forParent: formData.get('for_parent') === 'on',
  forCoach: formData.get('for_coach') === 'on',
})

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const validateValues = (
  values: ContentFormValues
): { error?: string; status: ContentStatus } => {
  if (!values.title) return { error: 'タイトルを入力してください。', status: 'draft' }
  if (values.title.length > 120) {
    return { error: 'タイトルは120文字以内で入力してください。', status: 'draft' }
  }
  if (!values.body) return { error: '本文を入力してください。', status: 'draft' }
  if (values.body.length > 20000) {
    return { error: '本文は20000文字以内で入力してください。', status: 'draft' }
  }
  if (values.category.length > 50) {
    return { error: 'カテゴリは50文字以内で選択してください。', status: 'draft' }
  }
  if (values.externalVideoUrl && !isValidHttpUrl(values.externalVideoUrl)) {
    return { error: '外部動画URLは http または https のURLを入力してください。', status: 'draft' }
  }
  if (!CONTENT_STATUSES.includes(values.status as ContentStatus)) {
    return { error: 'ステータスの指定が不正です。', status: 'draft' }
  }
  if (!values.forStudent && !values.forParent && !values.forCoach) {
    return { error: '対象ユーザーを1つ以上選択してください。', status: 'draft' }
  }
  return { status: values.status as ContentStatus }
}

const uploadThumbnail = async (
  formData: FormData,
  currentUrl: string,
  userId: string
): Promise<{ error?: string; url: string }> => {
  const file = formData.get('thumbnail')
  if (!(file instanceof File) || file.size === 0) return { url: currentUrl }

  if (!file.type.startsWith('image/')) {
    return { error: 'サムネイル画像は画像ファイルを選択してください。', url: currentUrl }
  }
  if (file.size > MAX_THUMBNAIL_BYTES) {
    return { error: 'サムネイル画像は5MB以下にしてください。', url: currentUrl }
  }

  const supabase = await createClient()
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('[admin contents] thumbnail upload failed', error)
    return { error: 'サムネイル画像のアップロードに失敗しました。Storage設定を確認してください。', url: currentUrl }
  }

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}

const saveContent = async (
  contentId: string | null,
  formData: FormData
): Promise<ContentFormState> => {
  const values = parseValues(formData)
  const validated = validateValues(values)
  if (validated.error) return { error: validated.error, values }

  const userId = await requireAdminUser()
  const thumbnail = await uploadThumbnail(formData, values.thumbnailUrl, userId)
  if (thumbnail.error) return { error: thumbnail.error, values }

  const supabase = await createClient()
  const { data: existing } = contentId
    ? await supabase
        .from('contents')
        .select('published_at, created_by')
        .eq('id', contentId)
        .maybeSingle()
    : { data: null }

  const publishedAt =
    validated.status === 'published'
      ? existing?.published_at ?? new Date().toISOString()
      : null

  const row = {
    ...(contentId ? { id: contentId } : {}),
    title: values.title,
    body: values.body,
    thumbnail_url: isSupportedImageUrl(thumbnail.url) ? thumbnail.url : null,
    category: values.category || null,
    external_video_url: values.externalVideoUrl || null,
    status: validated.status,
    published_at: publishedAt,
    created_by: existing?.created_by ?? userId,
    for_student: values.forStudent,
    for_parent: values.forParent,
    for_coach: values.forCoach,
  }

  const { data, error } = await supabase
    .from('contents')
    .upsert(row)
    .select('id')
    .single()

  if (error || !data) {
    console.error('[admin contents] upsert failed', error)
    return { error: 'コンテンツの保存に失敗しました。時間をおいて再度お試しください。', values }
  }

  revalidatePath('/admin/contents')
  revalidatePath('/contents')
  revalidatePath('/parent/contents')
  revalidatePath('/coach/contents')
  redirect('/admin/contents')
}

export const createContent = async (
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> => {
  return saveContent(null, formData)
}

export const updateContent = async (
  contentId: string,
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> => {
  return saveContent(contentId, formData)
}

const setContentStatus = async (
  contentId: string,
  status: ContentStatus
): Promise<void> => {
  if (!CONTENT_STATUSES.includes(status)) return
  await requireAdminUser()

  const supabase = await createClient()
  const { error } = await supabase
    .from('contents')
    .update({
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', contentId)

  if (error) {
    console.error('[admin contents] status update failed', error)
  }

  revalidatePath('/admin/contents')
  revalidatePath('/contents')
  revalidatePath('/parent/contents')
  revalidatePath('/coach/contents')
}

export const publishContent = async (contentId: string): Promise<void> => {
  await setContentStatus(contentId, 'published')
}

export const unpublishContent = async (contentId: string): Promise<void> => {
  await setContentStatus(contentId, 'draft')
}

export const archiveContent = async (contentId: string): Promise<void> => {
  await setContentStatus(contentId, 'archived')
}
