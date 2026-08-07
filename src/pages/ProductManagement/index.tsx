import { Suspense } from 'react'
import { Skeleton } from 'antd'
import { ProductManagementContent } from './ProductManagementContent'

const ProductManagement = () => <Suspense fallback={<Skeleton active className="p-24" />}><ProductManagementContent /></Suspense>

export default ProductManagement
