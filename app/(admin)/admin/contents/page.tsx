import Image from 'next/image'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/admin'
import {
  CONTENT_STATUS_LABEL,
  fetchAdminContents,
  formatDateTime,
  type AdminContentListItem,
} from '@/lib/contents'
import { isSupportedImageUrl } from '@/lib/image-url'
import {
  archiveContent,
  publishContent,
  unpublishContent,
} from './actions'

export const metadata = {
  title: 'コンテンツ管理 | 野球ノート',
}

const audienceLabel = (item: AdminContentListItem): string => {
  const labels = [
    item.forStudent ? '学生' : null,
    item.forParent ? '保護者' : null,
    item.forCoach ? '監督' : null,
  ].filter(Boolean)
  return labels.join(' / ')
}

const statusClassName = (status: AdminContentListItem['status']): string => {
  if (status === 'published') return 'bg-emerald-50 text-emerald-700'
  if (status === 'archived') return 'bg-slate-200 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}

export default async function AdminContentsPage() {
  await requireAdminUser()
  const items = await fetchAdminContents()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">運営</p>
          <h1 className="text-xl font-semibold text-slate-900">コンテンツ管理</h1>
        </div>
        <Link
          href="/admin/contents/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          新規作成
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
          まだコンテンツがありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="grid gap-4 p-4 md:grid-cols-[144px_1fr_auto]">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 md:aspect-auto md:h-24">
                  {isSupportedImageUrl(item.thumbnailUrl) ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 144px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(item.status)}`}
                    >
                      {CONTENT_STATUS_LABEL[item.status]}
                    </span>
                    {item.category && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
                    {item.title}
                  </h2>
                  <dl className="grid gap-1 text-xs text-slate-500 sm:grid-cols-3">
                    <div>
                      <dt className="font-medium text-slate-400">対象</dt>
                      <dd>{audienceLabel(item)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-400">公開日時</dt>
                      <dd>{formatDateTime(item.publishedAt)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-400">更新日時</dt>
                      <dd>{formatDateTime(item.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-start gap-2 md:w-44 md:flex-col">
                  <Link
                    href={`/admin/contents/${item.id}/edit`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    編集
                  </Link>
                  {item.status === 'published' ? (
                    <form action={unpublishContent.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        非公開
                      </button>
                    </form>
                  ) : (
                    <form action={publishContent.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
                      >
                        公開
                      </button>
                    </form>
                  )}
                  {item.status !== 'archived' && (
                    <form action={archiveContent.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        アーカイブ
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
