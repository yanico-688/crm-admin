import React from 'react';
import { message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import copy from 'copy-to-clipboard';

interface Props {
  text: string;
}

const CopyToClipboard: React.FC<Props> = ({ text }) => {
  const intl = useIntl();

  const copyText = () => {
    const success = copy(text, {
      debug: false,
      message: 'Press #{key} to copy',
    });

    if (success) {
      message.success(
        intl.formatMessage({
          id: 'copy.success',
          defaultMessage: 'Text copied to clipboard',
        }),
      );
    } else {
      message.error(
        intl.formatMessage({
          id: 'copy.error',
          defaultMessage: 'Copy failed',
        }),
      );
    }
  };

  return (
    <CopyOutlined
      style={{ color: '#1890ff', cursor: 'pointer' }}
      onClick={copyText}
    />
  );
};

export default CopyToClipboard;
