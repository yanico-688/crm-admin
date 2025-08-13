import React from 'react';
import {Badge} from 'antd';
import {useModel} from '@umijs/max';

interface TiXianRedProps {
  dom: React.ReactNode;
}
const TiXianRed: React.FC<TiXianRedProps>  = ({dom}) => {
  const { tiXianCount: count } = useModel('notificationModel');
  return (
    <Badge count={count}   offset={[20, 2]}>{dom}
    </Badge>
  );
};

export default TiXianRed;
