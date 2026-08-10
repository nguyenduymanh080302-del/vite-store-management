import { useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from '@/hooks/useCategory'
import { generatePathFromName, normalizeSlug, normalizeSpace } from '@/utils/hepler'
import { Button, Flex, Form, Input, Modal, Typography } from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

interface Props {
    mode: ModalActionMode
    handleChangeMode: (mode: ModalActionMode) => void
    selectedCategory: Category | null
}

const CategoryModal = ({ mode, handleChangeMode, selectedCategory }: Props) => {
    const intl = useIntl()
    const [form] = Form.useForm()

    const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategoryMutation();
    const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategoryMutation();
    const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategoryMutation();


    const handleGenerateSlug = () => {
        const name = form.getFieldValue('name');
        if (!name) return;
        form.setFieldValue('slug', generatePathFromName(name));
    };

    const handleSubmit = async () => {
        try {
            if (!selectedCategory && mode !== "create") return;
            const values = mode === "delete" ? null : await form.validateFields();
            switch (mode) {
                case "create":
                    await createCategory(values);
                    break;
                case "edit":
                    await updateCategory({
                        id: selectedCategory!.id,
                        data: values,
                    });
                    break;
                case "delete":
                    await deleteCategory(selectedCategory!.id);
                    break;
            }
            handleChangeMode(null);
        } catch (error) {
            console.log("Action failed:", error);
        }
    };



    return (
        <Modal
            open={mode !== null}
            title={<FormattedMessage id={`management.category.modal.title.${mode}-category`} />}
            onCancel={() => handleChangeMode(null)}
            onOk={handleSubmit}
            okText={<FormattedMessage id={`management.category.modal.btn.${mode}`} />}
            okButtonProps={{ className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary', loading: isCreating || isUpdating || isDeleting }}
            cancelText={<FormattedMessage id="management.category.modal.btn.cancel" />}
        >
            {mode === "delete" ? (
                <Flex orientation="vertical" justify="center" align="center" className='p-24 border-red-4 border-2 rounded-12'>
                    <FormattedMessage id="management.category.modal.confirm-delete" />
                    <Typography.Text strong className="text-red-6 mx-4">{selectedCategory?.name}</Typography.Text>
                </Flex>
            ) : (
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        label={<FormattedMessage id="management.category.modal.label.category-name" />}
                        name="name" normalize={normalizeSpace}
                        rules={[
                            { required: true, message: <FormattedMessage id="message.category.name-is-required" /> },
                            { max: 32, message: <FormattedMessage id="message.category.name-max-length-is-32" /> }
                        ]}
                    >
                        <Input placeholder={intl.formatMessage({ id: "management.category.modal.placeholder.category-name" })} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="management.category.modal.label.category-slug" />}
                        required
                    >
                        <Flex gap={8}>
                            <Form.Item name="slug" noStyle normalize={normalizeSlug}
                                rules={[
                                    { required: true, message: <FormattedMessage id="message.category.slug-is-required" /> },
                                    { max: 32, message: <FormattedMessage id="message.category.slug-max-length-is-32" /> }
                                ]}
                            >
                                <Input
                                    placeholder={intl.formatMessage({
                                        id: "management.category.modal.placeholder.category-slug",
                                    })}
                                />
                            </Form.Item>

                            <Button type="primary" htmlType="button"
                                className="bg-blue-6"
                                onClick={handleGenerateSlug}
                            >
                                <FormattedMessage id="management.category.btn.generate-slug" />
                            </Button>
                        </Flex>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    )
}

export default CategoryModal