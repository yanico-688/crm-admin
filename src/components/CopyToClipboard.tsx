import React from 'react';
import { message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

interface Props {
  text: string;
}
const CopyToClipboard: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { text } = props;
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(
        intl.formatMessage({ id: 'copy.success', defaultMessage: 'Text copied to clipboard' }),
      );
    } catch (err) {
      message.error(intl.formatMessage({ id: 'copy.error', defaultMessage: 'Copy failed' }));
    }
  };

  return <CopyOutlined style={{ color: '#1890ff' }} onClick={copyText} />;
};

export default CopyToClipboard;
