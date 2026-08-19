import { Flex } from 'antd'
import { useState } from 'react'
import ProductHeader from './ProductHeader'
import ProductModal from './ProductModal'
import ProductTable from './ProductTable'

const ProductManagement = () => {
    const [mode, setMode] = useState<ModalActionMode>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [searchValue, setSearchValue] = useState('')

    const handleChangeMode = (mode: ModalActionMode, product?: Product) => {
        setMode(mode)

        switch (mode) {
            case 'create':
                setSelectedProduct(product ?? null)
                break

            case 'edit':
            case 'delete':
                setSelectedProduct(product ?? null)
                break
        }
    }

    return (
        <Flex vertical gap={12}>
            <ProductHeader
                searchValue={searchValue}
                handleChangeMode={handleChangeMode}
                setSearchValue={setSearchValue}
            />
            <ProductTable
                searchValue={searchValue}
                handleChangeMode={handleChangeMode}
            />
            <ProductModal
                key={`${mode ?? 'closed'}-${selectedProduct?.id ?? 'new'}`}
                mode={mode}
                selectedProduct={selectedProduct}
                handleChangeMode={handleChangeMode}
            />
        </Flex>
    )
}

export default ProductManagement
