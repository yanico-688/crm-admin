import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const TicketCategoriesSelect: React.FC = () => {
  const intl = useIntl();
  const { items: platforms, loading } = useQueryList('/platforms');

  return (
    <ProFormSelect
      rules={[{ required: true, message: intl.formatMessage({ id: 'platform.required' }) }]}
      options={platforms.map((platform: any) => ({
        label: platform.name,
        value: platform._id,
      }))}
      width="md"
      name="platform"
      label={intl.formatMessage({ id: 'account.platform' })}
      placeholder={intl.formatMessage({ id: 'platform.select' })}
      showSearch
      fieldProps={{
        loading,
        mode: 'multiple',
        optionFilterProp: 'label',
        filterOption: (input, option) =>
          ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase()),
      }}
    />
  );
};

export default TicketCategoriesSelect;
