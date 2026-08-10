import { IconPlus } from '@/assets/icons'
import { Button, Flex, Typography } from 'antd'
import React from 'react'
import { FormattedMessage } from 'react-intl'

const DeliveryHeader = () => {
    return (
        <Flex justify="space-between">
            <Typography.Title level={5} className="m-0" />
            <Button type="primary" size="middle"
                className="flex flex-row items-center gap-8"
                onClick={() => handleChangeMode('create')}
            >
                <IconPlus width={16} color="var(--color-neutral-0)" />
                <FormattedMessage id="management.delivery.btn.create-delivery" />
            </Button>
        </Flex>
    )
}

export default DeliveryHeader