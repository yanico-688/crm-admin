import {ProFormSelect} from '@ant-design/pro-components';
import React from 'react';
import {useIntl} from '@umijs/max';
import useQueryParamsList from "@/hooks/useQueryParamsList";

interface Props {
  newRecord?: boolean,
  onChange?: (value: string) => void,
  onCustomerChange?: (customer) => void
}

const EmailSelect: React.FC<Props> = ({onCustomerChange}) => {
  const intl = useIntl();
  const {items: filteredCustomers, loading} = useQueryParamsList('/customers',
    {
      params:
        {isAgent: true}
    }
  );
  return (
    <ProFormSelect
      rules={[{required: true}]}
      options={filteredCustomers.map((customer: any) => ({
        label: customer.email,
        value: customer._id,
      }))}
      width="md"
      name="customer"
      label={intl.formatMessage({id: 'agent_email_title'})}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          const selectedCustomer = filteredCustomers.find((c) => c._id === value);
          if (onCustomerChange && selectedCustomer) {
            onCustomerChange(selectedCustomer);
          }
        },
      }}
    />
  );
};

export default EmailSelect;
