import { locationMapping } from '@/utils/constants';
import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';

const CountrySelect: React.FC = () => {
  const intl = useIntl();
  return (
    <ProFormSelect
      mode="multiple"
      name="country"
      label={intl.formatMessage({ id: 'country' })}
      width="md"
      rules={[{ required: true, message: intl.formatMessage({ id: 'select_country' }) }]}
      valueEnum={locationMapping}
      placeholder={intl.formatMessage({ id: 'select_country' })}
    />
  );
};

export default CountrySelect;
