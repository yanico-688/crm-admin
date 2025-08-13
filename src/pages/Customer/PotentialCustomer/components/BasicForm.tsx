import {
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Form, Input, message, UploadProps } from 'antd';
import React from 'react';
import { uploadFormData } from '@/services/ant-design-pro/api';

const STATUS_OPTIONS = [
  { label: '已合作', value: '已合作' },
  { label: '待合作', value: '待合作' },
  { label: '谈判', value: '谈判' },
  { label: '未回复', value: '未回复' },
  { label: '确认放弃', value: '确认放弃' },
  { label: '邮箱错的', value: '邮箱错的' },
  { label: '长期合作', value: '长期合作' },
];

interface Props {
  newRecord?: boolean; // 新建时 true，编辑时 false
}

const BasicForm: React.FC<Props> = () => {
  // 自定义上传逻辑
  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as File);

    try {
      const res = await uploadFormData('/potentialCustomers/blogData', formData);
      if (res.success) {
        message.success('上传成功');

        onSuccess?.(res);

      } else {
        message.error('上传失败');
      }
    } catch (err: any) {
      message.error('上传失败（网络或服务端错误）');
      onError?.(err);
    }
  };
  return (
    <>
      <ProForm.Group>
        <ProFormText
          name="name"
          label="姓名"
          width="md"
          rules={[{ required: true, message: '请输入姓名' }]}
        />
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
        <ProFormDatePicker
          name="emailSendTime"
          label="发邮件时间"
          width="md"
          rules={[{ required: true, message: '请选择日期' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDatePicker name="secondInvitation" label="二次邀约" width="md" />
        <ProFormSelect
          name="status"
          label="状态"
          width="md"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择状态' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText name="owner" label="负责人员" width="md" />
        <ProFormUploadDragger
          name="image"
          width="md"
          max={1}
          label="博主数据"
          fieldProps={{
            listType: 'picture-card',
            customRequest: customRequest,
          }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea name="remark" label="备注" width="md" placeholder="请输入备注..." />
        <Form.Item name="_id" hidden>
          <Input type="hidden" />
        </Form.Item>
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
