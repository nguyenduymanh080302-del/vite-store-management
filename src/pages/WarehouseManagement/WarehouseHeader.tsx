import { IconPlus } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { Button, Flex, Typography } from 'antd'

interface Props {
    handleChangeMode: (mode: ModalActionMode, warehouse?: Warehouse) => void
}

const WarehouseHeader = ({ handleChangeMode }: Props) => {
    return (
        <Flex justify="space-between">
            <Typography.Title level={5} className="m-0" />
            <Button
                type="primary"
                size="middle"
                className="flex flex-row items-center gap-8"
                onClick={() => handleChangeMode('create')}
            >
                <IconPlus width={16} color="var(--color-neutral-0)" />
                <FormattedMessage id="management.warehouse.btn.create-warehouse" />
            </Button>
        </Flex>
    )
}

export default WarehouseHeader
