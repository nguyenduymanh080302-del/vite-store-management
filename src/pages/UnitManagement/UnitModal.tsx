import FormattedMessage from '@/components/FormattedMessage'
import { useCreateUnitMutation, useDeleteUnitMutation, useUpdateUnitMutation } from '@/hooks/useUnit'
import { normalizeSpace } from '@/utils/hepler'
import { Flex, Form, Input, Modal, Typography } from 'antd'
import type { FormInstance } from 'antd'
import { useIntl } from 'react-intl'

interface Props {
    mode: ModalActionMode
    handleChangeMode: (mode: ModalActionMode) => void
    selectedUnit: Unit | null
    form: FormInstance
}

const UnitModal = ({ mode, handleChangeMode, selectedUnit, form }: Props) => {
    const intl = useIntl()
    const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnitMutation()
    const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnitMutation()
    const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnitMutation()

    const handleSubmit = async () => {
        try {
            if (!selectedUnit && mode !== 'create') return

            const values = mode === 'delete' ? null : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createUnit(values)
                    break
                case 'edit':
                    await updateUnit({
                        id: selectedUnit!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteUnit(selectedUnit!.id)
                    break
            }

            handleChangeMode(null)
        } catch (error) {
            console.error('Action failed:', error)
        }
    }

    return (
        <Modal
            open={mode !== null}
            title={<FormattedMessage id={`management.unit.modal.title.${mode}-unit`} />}
            onCancel={() => handleChangeMode(null)}
            onOk={handleSubmit}
            okText={<FormattedMessage id={`management.unit.modal.btn.${mode}`} />}
            okButtonProps={{
                className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                loading: isCreating || isUpdating || isDeleting,
            }}
            cancelText={<FormattedMessage id="management.unit.modal.btn.cancel" />}
        >
            {mode === 'delete' ? (
                <Flex vertical justify="center" align="center" className="p-24 border-red-4 border-2 rounded-12">
                    <FormattedMessage id="management.unit.modal.confirm-delete" />
                    <Typography.Text strong className="text-red-6 mx-4">
                        {selectedUnit?.name}
                    </Typography.Text>
                </Flex>
            ) : (
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        label={<FormattedMessage id="management.unit.modal.label.unit-name" />}
                        name="name"
                        normalize={normalizeSpace}
                        rules={[
                            { required: true, message: <FormattedMessage id="message.unit.name-is-required" /> },
                            { max: 32, message: <FormattedMessage id="message.unit.name-max-length-is-32" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.unit.modal.placeholder.unit-name',
                            })}
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    )
}

export default UnitModal
