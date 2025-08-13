import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const PlatformDescSelect: React.FC = () => {
  const intl = useIntl();
  const { items: platforms, loading } = useQueryList('/platforms');

  const platformOptions = platforms.map((platform: any) => ({
    label: `${platform.name}~${platform.region.name}`,
    value: platform._id,
  }));

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={platformOptions}
      width="md"
      name="platform"
      label={intl.formatMessage({ id: 'account.platform' })}
      showSearch
      fieldProps={{ loading }}
    />
  );
};

export default PlatformDescSelect;
