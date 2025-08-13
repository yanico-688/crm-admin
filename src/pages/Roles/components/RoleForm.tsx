import React from 'react';
import { ModalForm, ProFormText, ProFormSwitch } from '@ant-design/pro-components';

export type RoleFormProps = {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  initialValues?: any;
  onFinish: (values: any) => Promise<boolean>;
};

const RoleForm: React.FC<RoleFormProps> = ({ open, onOpenChange, initialValues, onFinish }) => {
  return (
      <ModalForm
          title={initialValues?._id ? '编辑角色' : '新建角色'}
          open={open}
          onOpenChange={onOpenChange}
          initialValues={initialValues}
          onFinish={onFinish}
          modalProps={{
            destroyOnClose: true,
          }}
      >
        <ProFormText
            name="name"
            label="角色标识"
            placeholder="如：SUPER_ADMIN"
            rules={[{ required: true, message: '请输入角色标识' }]}
            disabled={!!initialValues?._id}
        />
        <ProFormText
            name="label"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText name="description" label="角色描述" />
        <ProFormSwitch name="active" label="是否启用" />
      </ModalForm>
  );
};

export default RoleForm;
