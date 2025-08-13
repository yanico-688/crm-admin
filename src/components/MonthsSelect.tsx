import {ProFormSelect, ProFormText} from '@ant-design/pro-components';
import React, {useEffect, useState} from 'react';
import {useIntl} from '@umijs/max';

interface Props {
  newRecord?: boolean;
  platforms: any[];
  selectedPlatformId: string | null;
  values?: {
    priceLabel?: string;
  };
}

const MonthsSelect: React.FC<Props> = ({
                                         newRecord = true,
                                         platforms,
                                         values,
                                         selectedPlatformId
                                       }) => {
  const intl = useIntl();
  const [monthOptions, setMonthOptions] = useState<{ label: string; value: number }[]>([]);


  useEffect(() => {
    if (selectedPlatformId) {
      const selectedPlatform = platforms.find((p) => p._id === selectedPlatformId);
      if (selectedPlatform && selectedPlatform.priceList) {
        const options = selectedPlatform.priceList.map((price) => ({

          label: `${price.months+'个月,座位:'+price.seatCount}`,
          value: price._id,
        }));
        setMonthOptions(options);
      } else {
        setMonthOptions([]);
      }
    } else {
      setMonthOptions([]);
    }
  }, [selectedPlatformId, platforms, intl]);

  if (!newRecord) {
    return (
      <ProFormText
        name="priceLabel"
        label={intl.formatMessage({ id: 'months' })}
        disabled
        fieldProps={{
          value: `${values.months}个月, 座位: ${values.seatCount}`,
          style: { color: '#000' }, // optional: 让字体看起来更像正常文本而不是灰色
        }}
        width="md"
      />
    );
  }


  return (
    <ProFormSelect
      rules={[{ required: true }]}
      width="md"
      name="priceListId"
      label={intl.formatMessage({ id: 'months' })}
      options={monthOptions}
      placeholder="请选择"
      disabled={!newRecord || monthOptions.length === 0}
    />
  );
};

export default MonthsSelect;
