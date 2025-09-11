import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import React from 'react';


interface Props {
  newRecord?: boolean; // 新建时传 true
}

const BasicForm: React.FC<Props> = ({ newRecord }) => {
  return (
    <>
      <ProForm.Group>
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
        <ProFormDatePicker name="publishDate" label="预计发布" width="md" />
        <ProFormDigit
          name="thisFee"
          label="本次稿费"
          min={0}
          width="md"
          fieldProps={{ precision: 2, step: 0.01 }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit name="firstCommission" label="首单佣金" min={0} width="md" />
        <ProFormDigit name="followUpCommission" label="后续佣金" min={0} width="md" />
      </ProForm.Group>
      <ProForm.Group>

        <ProFormTextArea name="remark" label="备注" width="md" />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
