import { lazyRouteComponent, RouteComponent } from '@tanstack/react-router'
import { PERMISSION } from '@/utils/enum'

type AppRoute = {
    path: string
    component: RouteComponent
    permission?: PERMISSION
    isAuth?: boolean
}

export const authRoutes: AppRoute[] = [
    {
        path: '/login',
        component: lazyRouteComponent(() => import('@/pages/Login')),
        isAuth: true,
    },
    {
        path: '/register',
        component: lazyRouteComponent(() => import('@/pages/Register')),
        isAuth: true,
    },
    {
        path: '/forgot-password',
        component: lazyRouteComponent(() => import('@/pages/ForgotPassword')),
        isAuth: true,
    },
]

export const managementRoutes: AppRoute[] = [
    {
        path: '/dashboard',
        component: lazyRouteComponent(() => import('@/pages/Dashboard')),
        permission: PERMISSION.MANAGE_DASHBOARD,
    },
    {
        path: '/category',
        component: lazyRouteComponent(() => import('@/pages/CategoryManagement')),
        permission: PERMISSION.MANAGE_CONTENT,
    },
    {
        path: '/product',
        component: lazyRouteComponent(() => import('@/pages/ProductManagement')),
        permission: PERMISSION.MANAGE_CONTENT,
    },
    {
        path: '/sales',
        component: lazyRouteComponent(() => import('@/pages/SalesManagement')),
        permission: PERMISSION.MANAGE_SALES,
    },
    {
        path: '/customer',
        component: lazyRouteComponent(() => import('@/pages/CustomerManagement')),
        permission: PERMISSION.MANAGE_SALES,
    },
    {
        path: '/delivery',
        component: lazyRouteComponent(() => import('@/pages/DeliveryManagement')),
        permission: PERMISSION.MANAGE_SALES,
    },
    {
        path: '/account',
        component: lazyRouteComponent(() => import('@/pages/AccountManagement')),
        permission: PERMISSION.MANAGE_ACCOUNT,
    },
    {
        path: '/supplier',
        component: lazyRouteComponent(() => import('@/pages/SupplierManagement')),
        permission: PERMISSION.MANAGE_CONTENT,
    },
    {
        path: '/unit',
        component: lazyRouteComponent(() => import('@/pages/UnitManagement')),
        permission: PERMISSION.MANAGE_CONTENT,
    },
    {
        path: '/warehouse',
        component: lazyRouteComponent(() => import('@/pages/WarehouseManagement')),
        permission: PERMISSION.MANAGE_WAREHOUSE,
    },
    {
        path: '/import',
        component: lazyRouteComponent(() => import('@/pages/ImportManagement')),
        permission: PERMISSION.MANAGE_WAREHOUSE,
    },
]
