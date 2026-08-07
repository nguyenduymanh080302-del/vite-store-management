import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { DashboardContent } from './DashboardContent'

const Dashboard = () => <Suspense fallback={<Skeleton active className="p-24" />}><DashboardContent /></Suspense>

export default Dashboard
