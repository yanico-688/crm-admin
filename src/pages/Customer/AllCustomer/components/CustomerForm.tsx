import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProForm,
} from '@ant-design/pro-components';
import React from 'react';

const STATUS_OPTIONS = [
  { label: '可领取', value: '可领取' },
  { label: '已被领取', value: '已被领取' },
  { label: '被打回', value: '被打回' },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: any) => Promise<boolean | void>;
  values?: any;
};

const CustomerForm: React.FC<Props> = ({ open, onOpenChange, onFinish, values }) => {
  return (
    <ModalForm
      title={values?._id ? '编辑客户' : '新建客户'}
      open={open}
      onOpenChange={onOpenChange}
      initialValues={values}
      onFinish={onFinish}
      modalProps={{ destroyOnClose: true }}
    >
      <ProForm.Group>
        <ProFormText name="_id" hidden />
        <ProFormText
          name="contact"
          label="联系方式"
          width="xl"
          rules={[{ required: true, message: '请输入联系方式' }]}
        />
        <ProFormSelect
          name="platformUrl"
          label="平台网址"
          rules={[{ required: true, message: '请输入平台网址' }]}
          mode="tags" // 允许手动输入多个
          width="xl"
          placeholder="可输入多个，用回车分隔"
        />

        <ProFormSelect
          name="blockedOwners"
          label="不可领取"
          mode="tags"
          width="md"
          placeholder="可输入多个用户，用回车分隔"
        />
        <ProFormSelect
          name="status"
          label="状态"
          width="md"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择状态' }]}
        />
        <ProFormText name="tags" label="标签" width="md" />
        <ProFormTextArea name="remark" label="备注" width="md" />
      </ProForm.Group>
    </ModalForm>
  );
};

export default CustomerForm;
