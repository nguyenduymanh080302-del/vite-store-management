import {
    createRootRoute,
    createRoute,
    createRouter
} from '@tanstack/react-router'
import { Suspense } from 'react'

import AuthLayout from '@/layouts/AuthLayout'
import ManagementLayout from '@/layouts/ManagementLayout'
import { PermissionGuard } from '@/router/PermissionGuard'
import { authRoutes, managementRoutes } from '@/router/routeConfig'
import { Skeleton } from 'antd'

const RouteFallback = () => <Skeleton active className="p-24" />

const rootRoute = createRootRoute()

/* ---------- Auth Layout ---------- */
const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: AuthLayout,
})

const authChildRoutes = authRoutes.map((r) =>
    createRoute({
        getParentRoute: () => authLayoutRoute,
        path: r.path,
        component: r.component,
    })
)

/* ---------- Management Layout ---------- */
const managementLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <PermissionGuard>
            <ManagementLayout />
        </PermissionGuard>
    ),
    pendingComponent: RouteFallback,
})

const managementChildRoutes = managementRoutes.map((r) =>
    createRoute({
        getParentRoute: () => managementLayoutRoute,
        path: r.path,
        component: () => (
            <PermissionGuard permission={r.permission}>
                <Suspense fallback={<RouteFallback />}>
                    <r.component />
                </Suspense>
            </PermissionGuard>
        ),
        pendingComponent: RouteFallback,
    })
)

const routeTree = rootRoute.addChildren([
    authLayoutRoute.addChildren(authChildRoutes),
    managementLayoutRoute.addChildren(managementChildRoutes),
])

const appRouter = createRouter({ routeTree })
export default appRouter
