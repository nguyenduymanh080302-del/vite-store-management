import { Button, Flex, Typography } from 'antd'

import { IconPlus } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'

interface Props {
    handleChangeMode: (mode: ModalActionMode, customer?: Customer) => void
}


const CustomerHeader = ({ handleChangeMode }: Props) => {
    return (
        <Flex justify="space-between">
            <Typography.Title level={5} className="m-0" />

            <Button
                type="primary"
                size="middle"
                className="flex flex-row items-center gap-8"
                onClick={() => handleChangeMode('create')}
            >
                <IconPlus
                    width={16}
                    color="var(--color-neutral-0)"
                />

                <FormattedMessage
                    id="management.customer.btn.create-customer"
                />
            </Button>
        </Flex>
    )
}

export default CustomerHeader