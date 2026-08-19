import FormattedMessage from '@/components/FormattedMessage'
import {
    useCreateDeliveryMutation,
    useDeleteDeliveryMutation,
    useUpdateDeliveryMutation,
} from '@/hooks/useDelivery'
import { normalizeSpace } from '@/utils/hepler'
import { Flex, Form, Input, Modal, Typography } from 'antd'
import type { FormInstance } from 'antd'
import { useIntl } from 'react-intl'

interface Props {
    mode: ModalActionMode
    handleChangeMode: (mode: ModalActionMode) => void
    selectedDelivery: Delivery | null
    form: FormInstance
}

const DeliveryModal = ({ mode, handleChangeMode, selectedDelivery, form }: Props) => {
    const intl = useIntl()
    const { mutateAsync: createDelivery, isPending: isCreating } = useCreateDeliveryMutation()
    const { mutateAsync: updateDelivery, isPending: isUpdating } = useUpdateDeliveryMutation()
    const { mutateAsync: deleteDelivery, isPending: isDeleting } = useDeleteDeliveryMutation()

    const handleSubmit = async () => {
        try {
            if (!selectedDelivery && mode !== 'create') return
            const values = mode === 'delete' ? null : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createDelivery(values)
                    break
                case 'edit':
                    await updateDelivery({
                        id: selectedDelivery!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteDelivery(selectedDelivery!.id)
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
            title={<FormattedMessage id={`management.delivery.modal.title.${mode}-delivery`} />}
            onCancel={() => handleChangeMode(null)}
            onOk={handleSubmit}
            okText={<FormattedMessage id={`management.delivery.modal.btn.${mode}`} />}
            okButtonProps={{
                className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                loading: isCreating || isUpdating || isDeleting,
            }}
            cancelText={<FormattedMessage id="management.delivery.modal.btn.cancel" />}
        >
            {mode === 'delete' ? (
                <Flex vertical justify="center" align="center" className="p-24 border-red-4 border-2 rounded-12">
                    <FormattedMessage id="management.delivery.modal.confirm-delete" />
                    <Typography.Text strong className="text-red-6 mx-4">
                        {selectedDelivery?.name}
                    </Typography.Text>
                </Flex>
            ) : (
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        label={<FormattedMessage id="management.delivery.modal.label.delivery-name" />}
                        name="name"
                        normalize={normalizeSpace}
                        rules={[
                            { required: true, message: <FormattedMessage id="message.delivery.name-is-required" /> },
                            { whitespace: true, message: <FormattedMessage id="message.delivery.name-not-empty" /> },
                            { max: 64, message: <FormattedMessage id="message.delivery.name-max-length-is-64" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.delivery.modal.placeholder.delivery-name',
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.delivery.modal.label.delivery-email" />}
                        name="email"
                        rules={[
                            { type: 'email', message: <FormattedMessage id="message.delivery.email-invalid" /> },
                            { max: 128, message: <FormattedMessage id="message.delivery.email-max-length-is-128" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.delivery.modal.placeholder.delivery-email',
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.delivery.modal.label.delivery-phone" />}
                        name="phone"
                        rules={[
                            { max: 20, message: <FormattedMessage id="message.delivery.phone-max-length-is-20" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.delivery.modal.placeholder.delivery-phone',
                            })}
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    )
}

export default DeliveryModal
