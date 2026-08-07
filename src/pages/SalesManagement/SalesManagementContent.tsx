import { Button, Flex, Input, Modal, Select, Table, Tag, Typography } from 'antd'
import type { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import { useDeleteOrderMutation, useOrderListQuery } from '@/hooks/useOrder'
import { useDebounce } from '@/hooks/useDebounce'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { ORDER_STATUS } from '@/utils/enum'
import { OrderFormModal } from './OrderFormModal'

const statusColorMap: Record<ORDER_STATUS, string> = {
    [ORDER_STATUS.PENDING]: 'gold',
    [ORDER_STATUS.CANCELED]: 'red',
    [ORDER_STATUS.DELIVERING]: 'cyan',
    [ORDER_STATUS.DONE]: 'green',
}

/**
 * Formats a numeric order amount for display using the active locale.
 * @param value The numeric amount to format.
 * @param locale The current locale string used by the UI.
 * @returns A locale-formatted monetary string.
 */
const formatAmount = (value?: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)

/**
 * Displays the sales order list page, filter controls, and create/edit/delete order modals.
 * @returns The sales management table screen.
 */
export const SalesManagementContent = () => {
    const locale = useAppStore((state) => state.locale)
    const intl = useIntl()
    const t = (id: string, defaultMessage: string) =>
        intl.formatMessage({ id, defaultMessage })

    const [filters, setFilters] = useState<GetOrdersQuery>({
        page: 1,
        limit: 10,
    })
    const [searchValue, setSearchValue] = useState('')
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const debouncedSearchValue = useDebounce(searchValue, 400)

    const queryFilters = useMemo(
        () => ({
            ...filters,
            page: 1,
            search: debouncedSearchValue.trim() || undefined,
        }),
        [debouncedSearchValue, filters]
    )

    const { data } = useOrderListQuery(queryFilters)
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrderMutation()

    const orderData = data?.data
    const orderList = orderData?.items || []
    const pagination = orderData?.pagination
    const orderStatusOptions = Object.values(ORDER_STATUS).map((status) => ({
        label: t(`order.status.${status.toLowerCase()}`, status),
        value: status,
    }))

    /**
     * Opens the modal in create, edit, or delete mode and stores the selected order context.
     * @param nextMode The modal action mode to activate.
     * @param order Optional order record used when editing or deleting.
     */
    const handleChangeMode = (nextMode: ModalActionMode, order?: Order) => {
        setMode(nextMode)
        setSelectedOrder(order || null)
        setOpen(true)
    }

    /**
     * Closes the active modal and resets the selected order state back to its default values.
     */
    const handleClose = () => {
        setSelectedOrder(null)
        setMode('create')
        setOpen(false)
    }

    /**
     * Deletes the selected order after confirmation and then closes the modal.
     */
    const handleSubmitDelete = async () => {
        if (!selectedOrder) return
        try {
            await deleteOrder(selectedOrder.id)
            handleClose()
        } catch (error) {
            console.error('Delete order failed:', error)
        }
    }

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
                    <IconTrash height={18} width={18} />
                </Button>
            ),
        },
    ]

    return (
        <Flex vertical gap={12}>
            <Flex justify="space-between" gap={12} wrap>
                <Flex gap={12} wrap style={{ flex: 1 }}>
                    <Input
                        allowClear
                        value={searchValue}
                        placeholder={intl.formatMessage({
                            id: 'management.sales.filter.search-placeholder',
                            defaultMessage: 'Search by order code, customer, or phone',
                        })}
                        onChange={(e) => {
                            setSearchValue(e.target.value)
                            setFilters((prev) => ({
                                ...prev,
                                page: 1,
                            }))
                        }}
                        style={{ width: 320, maxWidth: '100%' }}
                    />
                    <Select
                        allowClear
                        value={filters.status}
                        placeholder={intl.formatMessage({
                            id: 'management.sales.filter.status-placeholder',
                            defaultMessage: 'Filter status',
                        })}
                        options={orderStatusOptions}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                page: 1,
                                status: value,
                            }))
                        }
                        style={{ width: 180 }}
                    />
                </Flex>

                <Button type="primary" onClick={() => handleChangeMode('create')}>
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage
                        id="management.sales.btn.create-order"
                        defaultMessage="Create Order"
                    />
                </Button>
            </Flex>

            <Table<Order>
                rowKey="id"
                columns={columns}
                dataSource={orderList}
                pagination={{
                    current: pagination?.page || 1,
                    pageSize: pagination?.limit || 10,
                    total: pagination?.total || 0,
                    hideOnSinglePage: false,
                    onChange: (page, pageSize) =>
                        setFilters((prev) => ({
                            ...prev,
                            page,
                            limit: pageSize,
                        })),
                }}
                showSorterTooltip={false}
            />

            {/* Create/Edit Order Modal */}
            {open && mode !== 'delete' && (
                <OrderFormModal
                    open={open}
                    mode={mode}
                    order={selectedOrder}
                    onClose={handleClose}
                />
            )}

            {/* Delete Order Confirmation Modal */}
            <Modal
                open={open && mode === 'delete'}
                title={
                    <FormattedMessage
                        id="management.sales.modal.title.delete-order"
                        defaultMessage="Delete Order"
                    />
                }
                onCancel={handleClose}
                onOk={handleSubmitDelete}
                okText={
                    <FormattedMessage
                        id="management.sales.modal.btn.delete"
                        defaultMessage="Delete"
                    />
                }
                okButtonProps={{
                    className: 'bg-red-3',
                    loading: isDeleting,
                }}
                cancelText={
                    <FormattedMessage
                        id="management.sales.modal.btn.cancel"
                        defaultMessage="Cancel"
                    />
                }
            >
                <Flex
                    vertical
                    justify="center"
                    align="center"
                    className="p-24 border-red-4 border-2 rounded-12"
                >
                    <FormattedMessage
                        id="management.sales.modal.confirm-delete"
                        defaultMessage="Are you sure you want to delete this order?"
                    />
                    <Typography.Text strong className="mx-4">
                        {selectedOrder?.orderCode}
                    </Typography.Text>
                </Flex>
            </Modal>
        </Flex>
    )
}

