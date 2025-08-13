import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      copyright={process.env.UMI_APP_APP_NAME || 'Doloffer'}
      style={{
        background: 'none',
      }}
    />
  );
};

export default Footer;
