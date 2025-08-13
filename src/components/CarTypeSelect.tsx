import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const CarTypeSelect: React.FC = () => {
  const intl = useIntl();
  const { items: carTypes, loading } = useQueryList('/carTypes');
  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={carTypes.map((carType: any) => ({
        label: carType.name,
        value: carType._id,
      }))}
      width="md"
      name="carType"
      label={intl.formatMessage({ id: 'account.carType' })}
      showSearch
      fieldProps={{ loading }}
    />
  );
};

export default CarTypeSelect;
