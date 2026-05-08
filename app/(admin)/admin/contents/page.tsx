import Image from 'next/image'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/admin'
import {
  ADMIN_AUDIENCE_LABEL,
  ADMIN_PUBLISHED_PERIOD_LABEL,
  CONTENT_STATUS_LABEL,
  CONTENT_STATUSES,
  fetchAdminContents,
  formatDateTime,
  type AdminAudienceFilter,
  type AdminContentListItem,
  type AdminPublishedPeriod,
  type ContentStatus,
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

type SearchParams = Promise<{
  status?: string
  audience?: string
  period?: string
  page?: string
}>

const PAGE_SIZE = 20
const AUDIENCE_OPTIONS: AdminAudienceFilter[] = [
  'all',
  'student',
  'parent',
  'coach',
]
const PERIOD_OPTIONS: AdminPublishedPeriod[] = ['all', 'today', 'week', 'month']

const parseStatus = (value: string | undefined): ContentStatus =>
  CONTENT_STATUSES.includes(value as ContentStatus)
    ? (value as ContentStatus)
    : 'published'

const parseAudience = (value: string | undefined): AdminAudienceFilter =>
  AUDIENCE_OPTIONS.includes(value as AdminAudienceFilter)
    ? (value as AdminAudienceFilter)
    : 'all'

const parsePeriod = (
  value: string | undefined,
  status: ContentStatus
): AdminPublishedPeriod => {
  if (status !== 'published') return 'all'
  return PERIOD_OPTIONS.includes(value as AdminPublishedPeriod)
    ? (value as AdminPublishedPeriod)
    : 'all'
}

const parsePage = (value: string | undefined): number => {
  const page = Number(value)
  if (!Number.isInteger(page) || page < 1) return 1
  return page
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

const createHrefBuilder =
  ({
    status,
    audience,
    period,
    page,
  }: {
    status: ContentStatus
    audience: AdminAudienceFilter
    period: AdminPublishedPeriod
    page: number
  }) =>
  (overrides: {
    status?: ContentStatus
    audience?: AdminAudienceFilter
    period?: AdminPublishedPeriod
    page?: number
  }) => {
    const nextStatus = overrides.status ?? status
    const nextAudience = overrides.audience ?? audience
    const nextPeriod =
      nextStatus === 'published' ? overrides.period ?? period : 'all'
    const nextPage = overrides.page ?? page

    const params = new URLSearchParams()
    params.set('status', nextStatus)
    params.set('audience', nextAudience)
    if (nextStatus === 'published') params.set('period', nextPeriod)
    if (nextPage > 1) params.set('page', String(nextPage))
    return `/admin/contents?${params.toString()}`
  }

export default async function AdminContentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await requireAdminUser()

  const params = await searchParams
  const status = parseStatus(params.status)
  const audience = parseAudience(params.audience)
  const period = parsePeriod(params.period, status)
  const page = parsePage(params.page)
  const buildHref = createHrefBuilder({ status, audience, period, page })
  const { items, hasNext } = await fetchAdminContents({
    status,
    audience,
    period,
    page,
    limit: PAGE_SIZE,
  })

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md space-y-4 px-4 py-4">
      <header className="sticky top-0 z-10 -mx-4 space-y-3 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">運営</p>
            <h1 className="text-lg font-semibold text-slate-900">
              コンテンツ管理
            </h1>
          </div>
          <Link
            href="/admin/contents/new"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            新規作成
          </Link>
        </div>

        <FilterGroup label="ステータス">
          {CONTENT_STATUSES.map((option) => (
            <FilterChip
              key={option}
              href={buildHref({ status: option, page: 1 })}
              active={status === option}
            >
              {CONTENT_STATUS_LABEL[option]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="対象">
          {AUDIENCE_OPTIONS.map((option) => (
            <FilterChip
              key={option}
              href={buildHref({ audience: option, page: 1 })}
              active={audience === option}
            >
              {ADMIN_AUDIENCE_LABEL[option]}
            </FilterChip>
          ))}
        </FilterGroup>

        {status === 'published' && (
          <FilterGroup label="公開日時">
            {PERIOD_OPTIONS.map((option) => (
              <FilterChip
                key={option}
                href={buildHref({ period: option, page: 1 })}
                active={period === option}
              >
                {ADMIN_PUBLISHED_PERIOD_LABEL[option]}
              </FilterChip>
            ))}
          </FilterGroup>
        )}
      </header>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {CONTENT_STATUS_LABEL[status]} / {ADMIN_AUDIENCE_LABEL[audience]}
          {status === 'published'
            ? ` / ${ADMIN_PUBLISHED_PERIOD_LABEL[period]}`
            : ''}
        </span>
        <span>{page}ページ目</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
          条件に合うコンテンツがありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}

      <nav className="grid grid-cols-2 gap-3 pb-4" aria-label="ページ送り">
        {page > 1 ? (
          <Link
            href={buildHref({ page: page - 1 })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700"
          >
            前の20件
          </Link>
        ) : (
          <span />
        )}
        {hasNext && (
          <Link
            href={buildHref({ page: page + 1 })}
            className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white"
          >
            次の20件
          </Link>
        )}
      </nav>
    </div>
  )
}

const FilterGroup = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <section className="space-y-1">
    <h2 className="text-[11px] font-medium text-slate-500">{label}</h2>
    <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
  </section>
)

const FilterChip = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) => (
  <Link
    href={href}
    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
      active
        ? 'bg-slate-900 text-white'
        : 'border border-slate-300 bg-white text-slate-700'
    }`}
    aria-current={active ? 'page' : undefined}
  >
    {children}
  </Link>
)

const ContentCard = ({ item }: { item: AdminContentListItem }) => (
  <article className="overflow-hidden rounded-lg bg-white shadow-sm">
    <div className="relative aspect-video bg-slate-100">
      {isSupportedImageUrl(item.thumbnailUrl) ? (
        <Image
          src={item.thumbnailUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
          No image
        </div>
      )}
      <span
        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(item.status)}`}
      >
        {CONTENT_STATUS_LABEL[item.status]}
      </span>
    </div>

    <div className="space-y-3 p-4">
      <div className="space-y-1">
        {item.category && (
          <p className="text-xs font-medium text-slate-500">{item.category}</p>
        )}
        <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
          {item.title}
        </h2>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
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

      <div className="grid grid-cols-3 gap-2">
        <Link
          href={`/admin/contents/${item.id}/edit`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700"
        >
          編集
        </Link>
        {item.status === 'published' ? (
          <form action={unpublishContent.bind(null, item.id)}>
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              非公開
            </button>
          </form>
        ) : (
          <form action={publishContent.bind(null, item.id)}>
            <button
              type="submit"
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            >
              公開
            </button>
          </form>
        )}
        {item.status !== 'archived' ? (
          <form action={archiveContent.bind(null, item.id)}>
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              アーカイブ
            </button>
          </form>
        ) : (
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-400">
            アーカイブ済
          </span>
        )}
      </div>
    </div>
  </article>
)
