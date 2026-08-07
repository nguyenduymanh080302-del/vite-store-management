import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { CustomerManagementContent } from './CustomerManagementContent'

const CustomerManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><CustomerManagementContent /></Suspense>

export default CustomerManagement
