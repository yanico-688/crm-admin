import {
  ProFormSelect,
  ProFormSwitch,
  ProFormDigit,
  ProFormDatePicker,
  ProFormText,
  ProFormTextArea,
  ProForm,
} from '@ant-design/pro-components';
import React from 'react';

const STATUS_OPTIONS = [
  { label: '待合作', value: '待合作' },
  { label: '已合作', value: '已合作' },
];

import { Tag } from 'antd';

const TAG_OPTIONS = [
  { label: <Tag color="default">放弃</Tag>, value: '放弃' },
  { label: <Tag color="purple">加评论</Tag>, value: '加评论' },
  { label: <Tag color="red">拒绝</Tag>, value: '拒绝' },
  { label: <Tag color="blue">发文章</Tag>, value: '发文章' },
  { label: <Tag color="green">已完成</Tag>, value: '已完成' },
];


interface Props {
  newRecord?: boolean; // 新建时传 true
}

const BasicForm: React.FC<Props> = ({ newRecord }) => {
  return (
    <>
      <ProForm.Group>
        <ProFormSelect
          name="status"
          label="状态"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择状态' }]}
          width="md"
        />
        <ProFormText
          name="contact"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
          width="md"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="chatGPTReplyTags"
          label="ChatGPT回复"
          mode="multiple"
          options={TAG_OPTIONS}
          width="md"
        />
        <ProFormSwitch name="informChatGPT5" label="告知ChatGPT5" width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit name="totalFee" label="总稿费" min={0} width="md" />
        <ProFormDigit name="settledFee" label="已结稿费" min={0} width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit name="unsettledFee" label="未结稿费" min={0} width="md" />
        <ProFormDigit name="firstCommission" label="首单佣金" min={0} width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit name="followUpCommission" label="后续佣金" min={0} width="md" />
        <ProFormDatePicker name="publishDate" label="发布日期" width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText name="website" label="网址" width="md" />
        <ProFormText name="owner" label="负责人" width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea name="remark" label="备注" width="xl" />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
