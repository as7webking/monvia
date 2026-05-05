export type AppPlan = 'free' | 'pro'

export interface AccountAccess {
  isAdmin: boolean
  plan: AppPlan
  workspaceLimit: number | null
  badgeLabel: string
  overrideSource: 'default' | 'manual'
}

const ADMIN_EMAIL = 'admin@ahmedsultanline.com'

const manualOverrides: Record<string, Omit<AccountAccess, 'overrideSource'>> = {
  [ADMIN_EMAIL]: {
    isAdmin: true,
    plan: 'pro',
    workspaceLimit: null,
    badgeLabel: 'Admin override',
  },
}

export function getAccountAccess(email: string | null | undefined): AccountAccess {
  const normalizedEmail = email?.trim().toLowerCase()

  if (normalizedEmail && manualOverrides[normalizedEmail]) {
    return {
      ...manualOverrides[normalizedEmail],
      overrideSource: 'manual',
    }
  }

  return {
    isAdmin: false,
    plan: 'free',
    workspaceLimit: 1,
    badgeLabel: 'Free plan: 1 workspace',
    overrideSource: 'default',
  }
}

export function canCreateWorkspace(existingWorkspaceCount: number, access: AccountAccess) {
  return access.workspaceLimit === null || existingWorkspaceCount < access.workspaceLimit
}

export function buildAccountAccess({
  isAdmin,
  isPro,
  overrideSource,
}: {
  isAdmin: boolean
  isPro: boolean
  overrideSource: 'default' | 'manual'
}): AccountAccess {
  if (isAdmin) {
    return {
      isAdmin: true,
      plan: 'pro',
      workspaceLimit: null,
      badgeLabel: 'Admin override',
      overrideSource,
    }
  }

  if (isPro) {
    return {
      isAdmin: false,
      plan: 'pro',
      workspaceLimit: null,
      badgeLabel: 'Pro access',
      overrideSource,
    }
  }

  return {
    isAdmin: false,
    plan: 'free',
    workspaceLimit: 1,
    badgeLabel: 'Free plan: 1 workspace',
    overrideSource: 'default',
  }
}
