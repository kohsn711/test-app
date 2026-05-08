import Link from 'next/link'
import { requireAdminUser } from '@/lib/admin'
import {
  CONTENT_CATEGORIES,
  CONTENT_STATUS_LABEL,
  CONTENT_STATUSES,
} from '@/lib/contents'
import { createContent } from '../actions'
import { ContentForm } from '../content-form'

export const metadata = {
  title: 'コンテンツ新規作成 | 野球ノート',
}

export default async function NewContentPage() {
  await requireAdminUser()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <Link href="/admin/contents" className="text-sm text-slate-500">
        コンテンツ管理へ戻る
      </Link>
      <header>
        <p className="text-sm text-slate-500">運営</p>
        <h1 className="text-xl font-semibold text-slate-900">コンテンツ新規作成</h1>
      </header>
      <ContentForm
        action={createContent}
        defaults={{
          title: '',
          body: '',
          thumbnailUrl: '',
          category: '',
          externalVideoUrl: '',
          status: 'draft',
          forStudent: true,
          forParent: false,
          forCoach: false,
        }}
        categoryOptions={[...CONTENT_CATEGORIES]}
        statusOptions={CONTENT_STATUSES.map((status) => ({
          value: status,
          label: CONTENT_STATUS_LABEL[status],
        }))}
        submitLabel="作成する"
      />
    </div>
  )
}
