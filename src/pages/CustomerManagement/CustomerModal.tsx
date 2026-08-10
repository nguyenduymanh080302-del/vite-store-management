import { Flex, Form, Input, InputNumber, Modal, Typography } from 'antd'
import { useIntl } from 'react-intl'

import FormattedMessage from '@/components/FormattedMessage'
import { useCreateCustomerMutation, useDeleteCustomerMutation, useUpdateCustomerMutation } from '@/hooks/useCustomer'
import { normalizeSpace } from '@/utils/hepler'

interface Props {
    mode: ModalActionMode
    handleChangeMode: (mode: ModalActionMode) => void
    selectedCustomer: Customer | null
}

const CustomerModal = ({ mode, handleChangeMode, selectedCustomer }: Props) => {
    const intl = useIntl()
    const [form] = Form.useForm()
    const { mutateAsync: createCustomer, isPending: isCreating } = useCreateCustomerMutation();
    const { mutateAsync: updateCustomer, isPending: isUpdating } = useUpdateCustomerMutation();
    const { mutateAsync: deleteCustomer, isPending: isDeleting } = useDeleteCustomerMutation();

    const handleSubmit = async () => {
        try {
            if (!selectedCustomer && mode !== 'create') {
                return
            }

            const values =
                mode === 'delete'
                    ? null
                    : await form.validateFields()

            switch (mode) {
                case 'create':
                    await createCustomer(values)
                    break

                case 'edit':
                    await updateCustomer({
                        id: selectedCustomer!.id,
                        data: values,
                    })
                    break

                case 'delete':
                    await deleteCustomer(selectedCustomer!.id)
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
            title={<FormattedMessage id={`management.customer.modal.title.${mode}-customer`} />}
            onCancel={() => handleChangeMode(null)}
            onOk={handleSubmit}
            okText={<FormattedMessage id={`management.customer.modal.btn.${mode}`} />
            }
            okButtonProps={{
                className:
                    mode === 'delete'
                        ? 'bg-red-3'
                        : 'bg-main-primary',
                loading: isCreating || isUpdating || isDeleting,
            }}
            cancelText={
                <FormattedMessage id="management.customer.modal.btn.cancel" />
            }
        >
            {mode === 'delete' ? (
                <Flex
                    vertical
                    justify="center"
                    align="center"
                    className="p-24 border-red-4 border-2 rounded-12"
                >
                    <FormattedMessage
                        id="management.customer.modal.confirm-delete"
                    />

                    <Typography.Text
                        strong
                        className="text-red-6 mx-4"
                    >
                        {selectedCustomer?.name}
                    </Typography.Text>
                </Flex>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    preserve={false}
                >
                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.customer.modal.label.customer-name"
                            />
                        }
                        name="name"
                        normalize={normalizeSpace}
                        rules={[
                            {
                                required: true,
                                message: (
                                    <FormattedMessage id="message.customer.name-is-required" />
                                ),
                            },
                            {
                                whitespace: true,
                                message: (
                                    <FormattedMessage id="message.customer.name-not-empty" />
                                ),
                            },
                            {
                                max: 64,
                                message: (
                                    <FormattedMessage id="message.customer.name-max-length-is-64" />
                                ),
                            },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.customer.modal.placeholder.customer-name',
                            })}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.customer.modal.label.customer-email"
                            />
                        }
                        name="email"
                        rules={[
                            {
                                type: 'email',
                                message: (
                                    <FormattedMessage id="message.customer.email-invalid" />
                                ),
                            },
                            {
                                max: 128,
                                message: (
                                    <FormattedMessage id="message.customer.email-max-length-is-128" />
                                ),
                            },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.customer.modal.placeholder.customer-email',
                            })}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.customer.modal.label.customer-phone"
                            />
                        }
                        name="phone"
                        rules={[
                            {
                                pattern: /^(03|05|07|08|09)\d{8}$/,
                                message: (
                                    <FormattedMessage id="message.customer.phone-invalid-vn" />
                                ),
                            },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.customer.modal.placeholder.customer-phone',
                            })}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.customer.modal.label.customer-address"
                            />
                        }
                        name="address"
                        rules={[
                            {
                                max: 255,
                                message: (
                                    <FormattedMessage id="message.customer.address-max-length-is-255" />
                                ),
                            },
                        ]}
                    >
                        <Input
                            placeholder={intl.formatMessage({
                                id: 'management.customer.modal.placeholder.customer-address',
                            })}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <FormattedMessage
                                id="management.customer.modal.label.customer-debt"
                            />
                        }
                        name="debt"
                        rules={[
                            {
                                type: 'number',
                                message: (
                                    <FormattedMessage id="message.customer.debt-must-is-number" />
                                ),
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder={intl.formatMessage({
                                id: 'management.customer.modal.placeholder.customer-debt',
                            })}
                            className="w-full"
                            min={0}
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    )
}

export default CustomerModal