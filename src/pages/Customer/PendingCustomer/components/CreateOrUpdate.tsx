import { ModalForm } from '@ant-design/pro-components';
import React from 'react';
import BasicForm from './BasicForm';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<boolean>;
  title: string;
  initialValues?: Record<string, any>;
}

const ModalFormWrapper: React.FC<Props> = ({
                                             open,
                                             onOpenChange,
                                             onFinish,
                                             title,
                                             initialValues = {},
                                           }) => {
  return (
    <ModalForm
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <BasicForm newRecord={!initialValues._id} />
    </ModalForm>
  );
};

export default ModalFormWrapper;
