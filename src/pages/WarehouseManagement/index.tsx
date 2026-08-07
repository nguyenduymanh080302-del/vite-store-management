import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { WarehouseManagementContent } from './WarehouseManagementContent'

const WarehouseManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><WarehouseManagementContent /></Suspense>

export default WarehouseManagement
