import { AuthenticatedLayout } from '@/components'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
