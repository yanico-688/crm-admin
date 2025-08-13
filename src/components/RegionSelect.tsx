import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const RegionSelect: React.FC = () => {
  const intl = useIntl();
  const { items: regions, loading } = useQueryList('/regions');
  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={regions.map((region: any) => ({
        label: region.name,
        value: region._id,
      }))}
      width="md"
      name="region"
      label={intl.formatMessage({ id: 'platform.region' })}
      showSearch
      fieldProps={{ loading }}
    />
  );
};

export default RegionSelect;
