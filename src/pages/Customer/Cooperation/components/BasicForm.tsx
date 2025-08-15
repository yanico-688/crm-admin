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
  { label: '已合作', value: '已合作' },
  { label: '待合作', value: '待合作' },
  { label: '谈判', value: '谈判' },
  { label: '未回复', value: '未回复' },
  { label: '未联系', value: '未联系' },
  { label: '确认放弃', value: '确认放弃' },
  { label: '邮箱错的', value: '邮箱错的' },
  { label: '长期合作', value: '长期合作' },
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
        <ProFormSwitch name="informChatGPT5" label="告知ChatGPT5" width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="chatGPTReplyTags"
          label="ChatGPT回复"
          mode="multiple"
          options={TAG_OPTIONS}
          width="xl"
        />
        <ProFormSelect
          name="contact"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
          mode="tags" // 允许手动输入多个
          width="xl"
          placeholder="可输入多个，用回车分隔"
        />

      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name="settledFee"
          label="已结稿费"
          min={0}
          width="md"
          fieldProps={{
            precision: 2, // 允许保留两位小数
            step: 0.01,   // 每次递增/递减的值
          }}
        />

        <ProFormDigit
          name="unsettledFee"
          label="未结稿费"
          min={0}
          width="md"
          fieldProps={{
            precision: 2,
            step: 0.01,
          }}
        />

      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit name="firstCommission" label="首单佣金" min={0} width="md" />
        <ProFormDigit name="followUpCommission" label="后续佣金" min={0} width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDatePicker name="publishDate" label="初始发布" width="md" />
        <ProFormDatePicker name="publishDate2" label="最新日期" width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="website"
          label="网址"
          mode="tags"
          width='xl'
          placeholder="可输入多个，用回车分隔"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText name="owner" label="负责人" width="md" />
        <ProFormTextArea name="remark" label="备注" width="md" />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
