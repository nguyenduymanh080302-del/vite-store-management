import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { SupplierManagementContent } from './SupplierManagementContent'

const SupplierManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><SupplierManagementContent /></Suspense>

export default SupplierManagement
