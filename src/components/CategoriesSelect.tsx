import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const CategoriesSelect: React.FC = () => {
  const intl = useIntl();
  const { items: categories, loading } = useQueryList('/categories');
  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={categories.map((category: any) => ({
        label: category.name,
        value: category._id,
      }))}
      width="md"
      name="category"
      label={intl.formatMessage({ id: 'account.platform' })}
      showSearch
      fieldProps={{ loading }}
    />
  );
};

export default CategoriesSelect;
