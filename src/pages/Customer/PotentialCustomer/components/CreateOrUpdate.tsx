import { ModalForm } from '@ant-design/pro-components';
import React from 'react';
import BasicForm from './BasicForm';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (values: any) => Promise<void>;
  initialValues?: any; // 编辑时的初始值
  isNew?: boolean;
}

const CustomerModalForm: React.FC<Props> = ({
  open,
  onOpenChange,
  onFinish,
  initialValues,
  isNew = false,
}) => {
  return (
    <ModalForm
      title={isNew ? '新建客户' : '编辑客户'}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={initialValues}
      // onFinish={onFinish}
      onFinish={async (value) => {
        await onFinish({
          ...value,
          bloggerData: value.image[0]?.response?.filePath,
          image: '',
        });
      }}
    >
      <BasicForm newRecord={isNew} />
    </ModalForm>
  );
};

export default CustomerModalForm;
