import { type ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { Skeleton } from 'antd'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSION } from '@/utils/enum'

type Props = {
    permission?: PERMISSION
    children: ReactNode
}

export function PermissionGuard({ permission, children }: Props) {
    const { account, isAuthInitialized } = useAuthStore()

    if (!isAuthInitialized) {
        return <Skeleton active className="p-24" />
    }

    if (!account) {
        return <Navigate to="/auth/login" />
    }

    if (
        permission &&
        !account.role?.permissions?.includes(permission)
    ) {
        return <div>403 - Permission denied</div>
    }

    return <>{children}</>
}

