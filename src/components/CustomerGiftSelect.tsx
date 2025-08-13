import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const CustomerGiftSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: customers, loading } = useQueryList('/customers/selectCustomers');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={customers.map((customer: any) => ({
        label: customer.email,
        value: customer._id,
      }))}
      width="md"
      name="customerId"
      label={intl.formatMessage({ id: 'role.customer' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          console.log('Selected customer value:', value); // 添加选择值的日志
          // 明确指定 value 的类型
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default CustomerGiftSelect;
