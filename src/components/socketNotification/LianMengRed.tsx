import {useModel} from "@umijs/max";
import {Badge} from "antd";

interface ShiYongRedProps {
  dom: React.ReactNode;
}
const ShiYongRed: React.FC<ShiYongRedProps>  = ({dom}) => {
  const { lianMengCount: count } = useModel('notificationModel');
  return (
    <Badge count={count}   offset={[20, 2]}>{dom}
    </Badge>
  );
};

export default ShiYongRed;
