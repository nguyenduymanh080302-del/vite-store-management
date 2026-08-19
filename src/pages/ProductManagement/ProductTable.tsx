import { Button, Flex, Table, Tag, Typography } from 'antd'
import type { ColumnType } from 'antd/es/table'
import { useAppStore } from '@/stores/app.store'
import { useDebounce } from '@/hooks/useDebounce'
import { useProductListQuery } from '@/hooks/useProduct'
import { removeCharactersTone } from '@/utils/hepler'
import FormattedMessage from '@/components/FormattedMessage'
import { formatAmount } from './productManagement.shared'

interface Props {
    handleChangeMode: (mode: ModalActionMode, product?: Product) => void
    searchValue: string
}

const ProductTable = ({ handleChangeMode, searchValue }: Props) => {
    const locale = useAppStore((state) => state.locale)
    const debouncedSearchValue = useDebounce(searchValue, 300)
    const querySearch = debouncedSearchValue.trim()
        ? removeCharactersTone(debouncedSearchValue.trim())
        : undefined

    const { data, isFetching } = useProductListQuery({
        page: 1,
        limit: 100,
        search: querySearch,
    })

    const productList = data?.data?.items || []

    const columns: ColumnType<Product>[] = [
        {
            title: <FormattedMessage id="table.column.image" />,
            dataIndex: 'images',
            width: 96,
            render: (images: Product['images']) => {
                const imageUrl = images?.[0]?.url

                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Product"
                        style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid var(--color-neutral-4)',
                        }}
                    />
                ) : (
                    <Typography.Text type="secondary">--</Typography.Text>
                )
            },
        },
        {
            title: <FormattedMessage id="table.column.product" />,
            dataIndex: 'name',
            render: (_, record) => (
                <Button
                    type="link"
                    className="px-0"
                    onClick={() => handleChangeMode('edit', record)}
                >
                    {record.name}
                </Button>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: <FormattedMessage id="table.column.category" />,
            render: (_, record) => record.category?.name,
        },
        {
            title: <FormattedMessage id="table.column.unit" />,
            dataIndex: 'units',
            render: (productUnits: Product['units']) => (
                <Flex vertical gap={4}>
                    {productUnits?.length ? (
                        productUnits.map((unit) => (
                            <Typography.Text key={`${unit.unitId}-${unit.sellPrice}`}>
                                {(unit.unit?.name || `Unit ${unit.unitId}`)}: {formatAmount(unit.sellPrice, locale)}
                            </Typography.Text>
                        ))
                    ) : (
                        <Typography.Text type="secondary">--</Typography.Text>
                    )}
                </Flex>
            ),
        },
        {
            title: <FormattedMessage id="table.column.active" />,
            dataIndex: 'isActive',
            render: (value: boolean) => (
                <Tag color={value ? 'green' : 'red'}>
                    <FormattedMessage id={value ? 'common.yes' : 'common.no'} />
                </Tag>
            ),
        },
    ]

    return (
        <Table<Product>
            rowKey="id"
            columns={columns}
            dataSource={productList}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            loading={isFetching}
            showSorterTooltip={false}
        />
    )
}

export default ProductTable
