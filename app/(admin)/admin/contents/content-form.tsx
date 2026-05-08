'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { isSupportedImageUrl } from '@/lib/image-url'
import type { ContentFormState } from './actions'

type ContentFormDefaults = {
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

type Props = {
  action: (
    state: ContentFormState,
    formData: FormData
  ) => Promise<ContentFormState>
  defaults: ContentFormDefaults
  categoryOptions: string[]
  statusOptions: { value: string; label: string }[]
  submitLabel: string
}

export const ContentForm = ({
  action,
  defaults,
  categoryOptions,
  statusOptions,
  submitLabel,
}: Props) => {
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(
    action,
    undefined
  )

  const values = state?.values
  const title = values?.title ?? defaults.title
  const body = values?.body ?? defaults.body
  const thumbnailUrl = values?.thumbnailUrl ?? defaults.thumbnailUrl
  const category = values?.category ?? defaults.category
  const externalVideoUrl = values?.externalVideoUrl ?? defaults.externalVideoUrl
  const status = values?.status ?? defaults.status
  const forStudent = values?.forStudent ?? defaults.forStudent
  const forParent = values?.forParent ?? defaults.forParent
  const forCoach = values?.forCoach ?? defaults.forCoach

  const categories = category
    ? Array.from(new Set([...categoryOptions, category]))
    : categoryOptions

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          タイトル <span className="text-red-600">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue={title}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="body" className="block text-sm font-medium text-slate-700">
          本文 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          required
          maxLength={20000}
          defaultValue={body}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm leading-relaxed focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-700">
          サムネイル画像
        </label>
        {isSupportedImageUrl(thumbnailUrl) ? (
          <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
          </div>
        ) : thumbnailUrl ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            現在のサムネイルURLは画像として表示できません。画像をアップロードすると置き換わります。
          </p>
        ) : null}
        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">
          対象ユーザー <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <input name="for_student" type="checkbox" defaultChecked={forStudent} />
            学生
          </label>
          <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <input name="for_parent" type="checkbox" defaultChecked={forParent} />
            保護者
          </label>
          <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <input name="for_coach" type="checkbox" defaultChecked={forCoach} />
            監督
          </label>
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="category" className="block text-sm font-medium text-slate-700">
          カテゴリ
        </label>
        <select
          id="category"
          name="category"
          defaultValue={category}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        >
          <option value="">未設定</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="external_video_url" className="block text-sm font-medium text-slate-700">
          外部動画URL
        </label>
        <input
          id="external_video_url"
          name="external_video_url"
          type="url"
          defaultValue={externalVideoUrl}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          ステータス
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? '保存中...' : submitLabel}
      </button>
    </form>
  )
}
