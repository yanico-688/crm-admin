import {ProFormSelect} from '@ant-design/pro-components';
import React from 'react';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
  from?: API.ItemData;
}

// 目标车选择
const CardSecretSelect: React.FC<Props> = ({newRecord = true, onChange, from}) => {
  const {items: allAccounts, loading} = useQueryList('/accounts');
  const accounts = allAccounts.filter(
    (account: any) =>
      // 不同车
      account._id !== from?._id &&
      // 车上还有座
      (account.salesRecords?.length ?? 0) < (account.seatCount ?? 0) &&
      // 是同一个商品
      account.platform?._id === from?.platform?._id &&
      // 月份一样
      account.months === from?.months &&
      // 座位一样
      account.seatCount === from?.seatCount &&
      //     车状态是在线的
      account.usageStatus === 'inUse'
  );

  return (
    <ProFormSelect
      rules={[{required: true}]}
      options={accounts.map((account: any) => ({
        label: `车ID:${account.cardSecretNumber ?? account.cardSecret ?? account._id}, 商品:${account.platform.name}-${account.platform?.region?.name || '-'},座次:${
          account.salesRecords?.length ?? 0
        }/${account.seatCount} 账号:${account.accountNumber} 密码:${account.cardSecret}`,
        value: account._id,
      }))}
      width="xl"
      name="account"
      label='目标车'
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

export default CardSecretSelect;
