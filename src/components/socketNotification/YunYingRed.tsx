import React from 'react';
import {Badge} from 'antd';
import {useModel} from '@umijs/max';

interface TiXianRedProps {
  dom: React.ReactNode;
}

const YunYingRed: React.FC<TiXianRedProps> = ({dom}) => {
  const {
    tiXianCount: count1 = 0,
    lianMengCount: count2 = 0,
    applyTrialCount: count3 = 0,
  } = useModel('notificationModel');

  const totalCount = (count1 || 0) + (count2 || 0) + (count3 || 0);

  return (
    <Badge count={totalCount} offset={[20, 2]}>
      {dom}
    </Badge>
  );

};

export default YunYingRed;
