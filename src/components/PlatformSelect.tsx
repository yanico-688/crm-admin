import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const PlatformSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: platforms, loading } = useQueryList('/platforms');
  const filteredPlatforms = platforms.filter((platform: any) => platform.isOnline);
  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={filteredPlatforms.map((platform: any) => ({
        label: `${platform.name} - ${platform.region?.name || ''}`,
        value: platform._id,
      }))}
      width="md"
      name="platform"
      label={intl.formatMessage({ id: 'account.platform' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
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

export default PlatformSelect;
