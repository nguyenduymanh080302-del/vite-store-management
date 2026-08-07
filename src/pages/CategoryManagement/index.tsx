import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { CategoryManagementContent } from './CategoryManagementContent'

const CategoryManagement = () => (
    <Suspense fallback={<Skeleton active className="p-24" />}>
        <CategoryManagementContent />
    </Suspense>
)

export default CategoryManagement
