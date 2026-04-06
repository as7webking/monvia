import { ReactNode } from "react"

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  // TODO: Add authentication logic here
  // For now, just render children
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  )
}