import { Button, Table, Tag } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { ORDER_STATUS } from '@/utils/enum'
import { useDebounce } from '@/hooks/useDebounce'
import { useOrderListQuery } from '@/hooks/useOrder'
import FormattedMessage from '@/components/FormattedMessage'
import { formatAmount, statusColorMap } from './salesManagement.shared'

interface Props {
    filters: GetOrdersQuery
    searchValue: string
    handleChangeMode: (mode: ModalActionMode, order?: Order) => void
    handlePageChange: (page: number, pageSize: number) => void
}

const SalesTable = ({ filters, searchValue, handleChangeMode, handlePageChange }: Props) => {
    const locale = useAppStore((state) => state.locale)
    const intl = useIntl()
    const debouncedSearchValue = useDebounce(searchValue, 400)

    const queryFilters = useMemo(
        () => ({
            ...filters,
            search: debouncedSearchValue.trim() || undefined,
        }),
        [debouncedSearchValue, filters]
    )

    const { data, isFetching } = useOrderListQuery(queryFilters)

    const orderData = data?.data
    const orderList = orderData?.items || []
    const pagination = orderData?.pagination

    const t = (id: string, defaultMessage: string) =>
        intl.formatMessage({ id, defaultMessage })

    const columns: ColumnType<Order>[] = [
        {
            title: <FormattedMessage id="table.column.order-code" defaultMessage="Order Code" />,
            dataIndex: 'orderCode',
            render: (_, record) => (
                <Button type="link" className="px-0" onClick={() => handleChangeMode('edit', record)}>
                    {record.orderCode}
                </Button>
            ),
        },
        {
            title: <FormattedMessage id="table.column.customer" />,
            dataIndex: 'customerName',
        },
        {
            title: <FormattedMessage id="table.column.status" defaultMessage="Status" />,
            dataIndex: 'status',
            render: (value: ORDER_STATUS) => (
                <Tag color={statusColorMap[value]}>
                    {t(`order.status.${value.toLowerCase()}`, value)}
                </Tag>
            ),
        },
        {
            title: <FormattedMessage id="table.column.total" defaultMessage="Total" />,
            dataIndex: 'totalAmount',
            render: (value: number) => formatAmount(value, locale),
        },
        {
            title: <FormattedMessage id="table.column.delivery-fee" defaultMessage="Delivery Fee" />,
            dataIndex: 'deliveryFee',
            render: (value?: number | null) => formatAmount(value || 0, locale),
        },
        {
            title: <FormattedMessage id="table.column.store-profit" defaultMessage="Store Profit" />,
            dataIndex: 'profit',
            render: (value?: number | null) => formatAmount(value || 0, locale),
        },
        {
            title: <FormattedMessage id="table.column.created-at" />,
            dataIndex: 'createdAt',
            render: (value: string) =>
                value
                    ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                    : '--',
        },
        {
            title: '',
            render: (_, record) => (
                <Button
                    type="primary"
                    className="bg-red-3"
                    onClick={() => handleChangeMode('delete', record)}
                >
                    <FormattedMessage id="common.delete" defaultMessage="Delete" />
                </Button>
            ),
        },
    ]

    return (
        <Table<Order>
            rowKey="id"
            columns={columns}
            dataSource={orderList}
            pagination={{
                current: pagination?.page || 1,
                pageSize: pagination?.limit || 10,
                total: pagination?.total || 0,
                hideOnSinglePage: false,
                onChange: handlePageChange,
            }}
            loading={isFetching}
            showSorterTooltip={false}
        />
    )
}

export default SalesTable
