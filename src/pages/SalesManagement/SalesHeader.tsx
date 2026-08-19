import { IconPlus } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { ORDER_STATUS } from '@/utils/enum'
import { Button, Flex, Input, Select } from 'antd'
import { useIntl } from 'react-intl'

interface Props {
    searchValue: string
    status?: OrderStatusValue
    handleSearchChange: (value: string) => void
    handleStatusChange: (value?: OrderStatusValue) => void
    handleChangeMode: (mode: ModalActionMode) => void
}

const SalesHeader = ({
    searchValue,
    status,
    handleSearchChange,
    handleStatusChange,
    handleChangeMode,
}: Props) => {
    const intl = useIntl()

    const orderStatusOptions = Object.values(ORDER_STATUS).map((currentStatus) => ({
        label: intl.formatMessage({
            id: `order.status.${currentStatus.toLowerCase()}`,
            defaultMessage: currentStatus,
        }),
        value: currentStatus,
    }))

    return (
        <Flex justify="space-between" gap={12} wrap>
            <Flex gap={12} wrap style={{ flex: 1 }}>
                <Input
                    allowClear
                    value={searchValue}
                    placeholder={intl.formatMessage({
                        id: 'management.sales.filter.search-placeholder',
                        defaultMessage: 'Search by order code, customer, or phone',
                    })}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    style={{ width: 320, maxWidth: '100%' }}
                />
                <Select
                    allowClear
                    value={status}
                    placeholder={intl.formatMessage({
                        id: 'management.sales.filter.status-placeholder',
                        defaultMessage: 'Filter status',
                    })}
                    options={orderStatusOptions}
                    onChange={(value) => handleStatusChange(value)}
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
    )
}

export default SalesHeader
