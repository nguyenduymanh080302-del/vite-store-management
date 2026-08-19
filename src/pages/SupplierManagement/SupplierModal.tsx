import FormattedMessage from '@/components/FormattedMessage'
import {
    useCreateSupplierMutation,
    useDeleteSupplierMutation,
    useUpdateSupplierMutation,
} from '@/hooks/useSupplier'
import { normalizeSpace } from '@/utils/hepler'
import { Flex, Form, Input, InputNumber, Modal, Typography } from 'antd'
import type { FormInstance } from 'antd'
import { useIntl } from 'react-intl'

interface Props {
    mode: ModalActionMode
    handleChangeMode: (mode: ModalActionMode) => void
    selectedSupplier: Supplier | null
    form: FormInstance
}

const SupplierModal = ({ mode, handleChangeMode, selectedSupplier, form }: Props) => {
    const intl = useIntl()
    const { mutateAsync: createSupplier, isPending: isCreating } = useCreateSupplierMutation()
    const { mutateAsync: updateSupplier, isPending: isUpdating } = useUpdateSupplierMutation()
    const { mutateAsync: deleteSupplier, isPending: isDeleting } = useDeleteSupplierMutation()

    const handleSubmit = async () => {
        try {
            if (!selectedSupplier && mode !== 'create') return
            const values = mode === 'delete' ? null : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createSupplier(values)
                    break
                case 'edit':
                    await updateSupplier({
                        id: selectedSupplier!.id,
                        data: values,
                    })
                    break
                case 'delete':
                    await deleteSupplier(selectedSupplier!.id)
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
            title={<FormattedMessage id={`management.supplier.modal.title.${mode}-supplier`} />}
            onCancel={() => handleChangeMode(null)}
            onOk={handleSubmit}
            okText={<FormattedMessage id={`management.supplier.modal.btn.${mode}`} />}
            okButtonProps={{
                className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                loading: isCreating || isUpdating || isDeleting,
            }}
            cancelText={<FormattedMessage id="management.supplier.modal.btn.cancel" />}
        >
            {mode === 'delete' ? (
                <Flex vertical justify="center" align="center" className="p-24 border-red-4 border-2 rounded-12">
                    <FormattedMessage id="management.supplier.modal.confirm-delete" />
                    <Typography.Text strong className="text-red-6 mx-4">
                        {selectedSupplier?.name}
                    </Typography.Text>
                </Flex>
            ) : (
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        label={<FormattedMessage id="management.supplier.modal.label.supplier-name" />}
                        name="name"
                        normalize={normalizeSpace}
                        rules={[
                            { required: true, message: <FormattedMessage id="message.supplier.name-is-required" /> },
                            { whitespace: true, message: <FormattedMessage id="message.supplier.name-not-empty" /> },
                            { max: 64, message: <FormattedMessage id="message.supplier.name-max-length-is-64" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.supplier.modal.placeholder.supplier-name',
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.supplier.modal.label.supplier-email" />}
                        name="email"
                        rules={[
                            { type: 'email', message: <FormattedMessage id="message.supplier.email-invalid" /> },
                            { max: 128, message: <FormattedMessage id="message.supplier.email-max-length-is-128" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.supplier.modal.placeholder.supplier-email',
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.supplier.modal.label.supplier-phone" />}
                        name="phone"
                        rules={[
                            { max: 20, message: <FormattedMessage id="message.supplier.phone-max-length-is-20" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.supplier.modal.placeholder.supplier-phone',
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.supplier.modal.label.supplier-address" />}
                        name="address"
                        rules={[
                            { max: 255, message: <FormattedMessage id="message.supplier.address-max-length-is-255" /> },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.supplier.modal.placeholder.supplier-address',
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.supplier.modal.label.supplier-debt" />}
                        name="debt"
                        rules={[
                            { type: 'number', message: <FormattedMessage id="message.supplier.debt-must-is-number" /> },
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            min={0}
                            placeholder={intl.formatMessage({
                                id: 'management.supplier.modal.placeholder.supplier-debt',
                            })}
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    )
}

export default SupplierModal
