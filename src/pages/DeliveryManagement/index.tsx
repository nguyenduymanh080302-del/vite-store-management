import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { DeliveryManagementContent } from './DeliveryManagementContent'

const DeliveryManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><DeliveryManagementContent /></Suspense>

export default DeliveryManagement
