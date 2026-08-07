import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { SalesManagementContent } from './SalesManagementContent'

const SalesManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><SalesManagementContent /></Suspense>

export default SalesManagement
