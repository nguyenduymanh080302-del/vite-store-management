import { IconPlus } from '@/assets/icons'
import { Button, Flex, Typography } from 'antd'
import { FormattedMessage } from 'react-intl'

interface Props {
    handleChangeMode: (mode: ModalActionMode, category?: Category) => void
}

const CategoryHeader = ({ handleChangeMode }: Props) => {

    return (
        <Flex justify='space-between'>
            <Typography.Title level={5} className="m-0">
            </Typography.Title>
            <Button type="primary" size="middle"
                className="flex flex-row items-center gap-8"
                onClick={() => handleChangeMode("create")}
            >
                <IconPlus width={16} color="var(--color-neutral-0)" />
                <FormattedMessage id="management.category.btn.create-category" />
            </Button>
        </Flex>
    )
}

export default CategoryHeader