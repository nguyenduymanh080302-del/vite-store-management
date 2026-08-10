import { Flex, Form } from 'antd';
import { useState } from 'react';
import CategoryModal from './CategoryModal';
import CategoryTable from './CategoryTable';
import CategoryHeader from './CatetegoryHeader';

const CategoryManagement = () => {

    const [mode, setMode] = useState<ModalActionMode>(null);
    const [form] = Form.useForm()
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const handleChangeMode = (mode: ModalActionMode, category?: Category) => {
        setMode(mode);
        switch (mode) {

            case "edit":
                if (category) {
                    form.setFieldsValue({
                        name: category.name,
                        slug: category.slug,
                    });
                    setSelectedCategory(category);
                }
                break;
            case "delete":
                if (category) {
                    setSelectedCategory(category);
                }
                break;
            case "create":
            case null:
                form.resetFields();
                setSelectedCategory(null);
        }
    }

    return (
        <Flex vertical gap={12}>
            <CategoryHeader handleChangeMode={handleChangeMode} />
            <CategoryTable handleChangeMode={handleChangeMode} />
            <CategoryModal mode={mode} selectedCategory={selectedCategory} handleChangeMode={handleChangeMode} />
        </Flex>

    )
}

export default CategoryManagement
