import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminUser } from '@/lib/admin'
import {
  CONTENT_CATEGORIES,
  CONTENT_STATUS_LABEL,
  CONTENT_STATUSES,
  fetchAdminContentById,
} from '@/lib/contents'
import { updateContent } from '../../actions'
import { ContentForm } from '../../content-form'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Params = Promise<{ id: string }>

export const metadata = {
  title: 'コンテンツ編集 | 野球ノート',
}

export default async function EditContentPage({
  params,
}: {
  params: Params
}) {
  await requireAdminUser()

  const { id } = await params
  if (!UUID.test(id)) notFound()

  const content = await fetchAdminContentById(id)
  if (!content) notFound()

  const action = updateContent.bind(null, content.id)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <Link href="/admin/contents" className="text-sm text-slate-500">
        コンテンツ管理へ戻る
      </Link>
      <header>
        <p className="text-sm text-slate-500">運営</p>
        <h1 className="text-xl font-semibold text-slate-900">コンテンツ編集</h1>
      </header>
      <ContentForm
        action={action}
        defaults={{
          title: content.title,
          body: content.body,
          thumbnailUrl: content.thumbnailUrl ?? '',
          category: content.category ?? '',
          externalVideoUrl: content.externalVideoUrl ?? '',
          status: content.status,
          forStudent: content.forStudent,
          forParent: content.forParent,
          forCoach: content.forCoach,
        }}
        categoryOptions={[...CONTENT_CATEGORIES]}
        statusOptions={CONTENT_STATUSES.map((status) => ({
          value: status,
          label: CONTENT_STATUS_LABEL[status],
        }))}
        submitLabel="保存する"
      />
    </div>
  )
}
