import { IconPlus } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { Button, Flex, Input } from 'antd'
import { useIntl } from 'react-intl'

interface Props {
    searchValue: string
    handleChangeMode: (mode: ModalActionMode) => void
    setSearchValue: (value: string) => void
}

const ProductHeader = ({ searchValue, handleChangeMode, setSearchValue }: Props) => {
    const intl = useIntl()

    return (
        <Flex justify="space-between" gap={12} wrap>
            <Input
                allowClear
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={intl.formatMessage({
                    id: 'management.product.filter.search-placeholder',
                })}
                style={{ maxWidth: 320 }}
            />

            <Button
                type="primary"
                onClick={() => handleChangeMode('create')}
            >
                <IconPlus width={16} color="var(--color-neutral-0)" />
                <FormattedMessage id="management.product.btn.create-product" />
            </Button>
        </Flex>
    )
}

export default ProductHeader
