import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { UnitManagementContent } from './UnitManagementContent'

const UnitManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><UnitManagementContent /></Suspense>

export default UnitManagement
