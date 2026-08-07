import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { ImportManagementContent } from './ImportManagementContent'

const ImportManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><ImportManagementContent /></Suspense>

export default ImportManagement
