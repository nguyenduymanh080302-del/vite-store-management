import { Flex, Input, Modal, Spin, Typography } from 'antd'
import FormattedMessage from '@/components/FormattedMessage'
import { useProductListQuery } from '@/hooks/useProduct'
import { useDebounce } from '@/hooks/useDebounce'
import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { removeCharactersTone } from '@/utils/hepler'

interface ProductSearchModalProps {
    open: boolean
    onCancel: () => void
    onSelectProduct: (product: Product) => void
    initialSearchValue?: string
}

/**
 * Shows a searchable product picker modal for selecting a product into the order form.
 * @param props The modal props including open state, close callback, select callback, and initial search value.
 * @returns A product search dialog with debounced lookup and selectable product cards.
 */
export const ProductSearchModal = ({
    open,
    onCancel,
    onSelectProduct,
    initialSearchValue = '',
}: ProductSearchModalProps) => {
    const intl = useIntl()
    const [productSearchValue, setProductSearchValue] = useState(initialSearchValue)
    const debouncedProductSearch = useDebounce(productSearchValue, 500)

    const normalizedSearchValue = debouncedProductSearch.trim()
        ? removeCharactersTone(debouncedProductSearch.trim())
        : undefined

    const { data: productSearchData, isLoading: isProductSearchLoading } = useProductListQuery({
        page: 1,
        limit: 20,
        search: normalizedSearchValue,
        isActive: true,
    })

    // Reset local search value when modal is opened/closed
    useEffect(() => {
        if (open) {
            setProductSearchValue(initialSearchValue)
        }
    }, [open, initialSearchValue])

    const searchProducts = (productSearchData?.data?.items || []).filter((item) => item.isActive)

    return (
        <Modal
            open={open}
            title={
                <FormattedMessage
                    id="management.sales.form.label.select-product"
                    defaultMessage="Select Product"
                />
            }
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Flex vertical gap={12}>
                <Input
                    allowClear
                    value={productSearchValue}
                    placeholder={intl.formatMessage({
                        id: 'management.sales.form.placeholder.search-product',
                        defaultMessage: 'Search product by name...',
                    })}
                    onChange={(e) => setProductSearchValue(e.target.value)}
                    size="large"
                />

                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {isProductSearchLoading ? (
                        <Flex justify="center" align="center" className="p-24">
                            <Spin />
                        </Flex>
                    ) : searchProducts.length === 0 ? (
                        <Flex justify="center" align="center" className="p-24">
                            <Typography.Text type="secondary">
                                {intl.formatMessage({
                                    id: 'management.sales.form.message.no-products',
                                    defaultMessage: 'No products found',
                                })}
                            </Typography.Text>
                        </Flex>
                    ) : (
                        <Flex vertical gap={8}>
                            {searchProducts.map((product) => (
                                <Flex
                                    key={product.id}
                                    onClick={() => onSelectProduct(product)}
                                    className="border-1 border-neutral-4 rounded-12 p-12 cursor-pointer hover:border-main-primary"
                                    align="center"
                                    gap={12}
                                >
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.name}
                                            style={{
                                                width: 120,
                                                height: 120,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 120,
                                                height: 120,
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography.Text type="secondary">
                                                No Image
                                            </Typography.Text>
                                        </div>
                                    )}
                                    <Flex vertical gap={4} style={{ flex: 1 }}>
                                        <Typography.Text strong style={{ fontSize: 16 }}>
                                            {product.name}
                                        </Typography.Text>
                                        <Typography.Text type="secondary">
                                            {product.category?.name}
                                        </Typography.Text>
                                    </Flex>
                                </Flex>
                            ))}
                        </Flex>
                    )}
                </div>
            </Flex>
        </Modal>
    )
}
