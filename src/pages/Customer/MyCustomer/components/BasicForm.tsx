import {
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import React from 'react';

const STATUS_OPTIONS = [
  { label: '谈判', value: '谈判' },
  { label: '未回复', value: '未回复' },
  { label: '确认放弃', value: '确认放弃' },
  { label: '邮箱错误', value: '邮箱错的' },
];
const CUS_OPTIONS = [
  { label: '待合作', value: 1 },
  { label: '放弃客户', value: 2 },
  { label: '无效客户', value: 3 },
];

interface Props {
  newRecord?: boolean; // 新建时 true，编辑时 false
}

const BasicForm: React.FC<Props> = () => {
  return (
    <div tabIndex={0} style={{ outline: 'none' }}>
      <ProForm.Group>
        <ProFormText name="name" label="姓名" width="md" />
        <ProFormText
          name="contact"
          label="联系方式"
          width="md"
          rules={[{ required: true, message: '请输入联系方式' }]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText
          name="platformUrl"
          label="平台网址"
          width="md"
          rules={[{ required: true, message: '请输入平台网址' }]}
        />
        <ProFormDatePicker name="emailSendTime" label="发邮件时间" width="md" />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormDatePicker name="secondInvitation" label="二次邀约" width="md" />
        <ProFormSelect
          name="status"
          label="回复状态"
          width="md"
          options={STATUS_OPTIONS}
          initialValue={'未回复'}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormSelect
          name="cusOpt"
          label="客户分类"
          width="md"
          options={CUS_OPTIONS}
        />
        <ProFormTextArea name="remark" label="备注" width="md" placeholder="请输入备注..." />
        <Form.Item name="_id" hidden>
          <Input type="hidden" />
        </Form.Item>
      </ProForm.Group>
    </div>
  );
};

export default BasicForm;
