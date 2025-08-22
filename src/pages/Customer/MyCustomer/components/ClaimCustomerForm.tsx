import { ModalForm, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { message, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { addItem, getList } from '@/services/ant-design-pro/api';

type Option = { label: string; value: string; count: number };
type TagWithCount = { label: string; value: string; count: number };
const ClaimCustomerModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}> = ({ open, onOpenChange, onSuccess }) => {
  const [tags, setTags] = useState<Option[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);

  // 打开时获取所有标签和数量
  useEffect(() => {
    if (open) {
      getList('/allCustomers/tagsWithCount').then((res) => {
        // 后端返回 [{ tag: "HBO Max [Platinum]", count: 55 }, ...]
        setTags(
          (res.data as string[]).map((t: any) => ({
            label: t.tag,
            value: t.tag,
            count: t.count,
          }))
        );
      });
    }
  }, [open]);

  return (
    <ModalForm
      title="领取客户"
      open={open}
      onOpenChange={onOpenChange}
      onFinish={async (values) => {
        if (!selectedTag) {
          message.error('请选择标签');
          return false;
        }
        if (values.count > selectedTag.count) {
          message.error(`最多只能领取 ${selectedTag.count} 个`);
          return false;
        }


        const success = await addItem('/myCustomers/claimByCount', {
          tag: selectedTag.value,
          count: values.count,
        });

        if (success) {
          message.success('领取成功');
          onSuccess();
          return true;
        }
        return false;
      }}
    >
      {/* 上方表格显示类别及可用数量 */}
      <Table
        dataSource={tags}
        columns={[
          { title: '类别', dataIndex: 'label' },
          { title: '可用数量', dataIndex: 'count' },
        ]}
        pagination={false}
        rowKey="value"
        size="small"
        style={{ marginBottom: 16 }}
      />

      {/* 领取类型 */}
      <ProFormSelect
        name="tag"
        label="领取标签"
        width="lg"
        options={tags}
        rules={[{ required: true, message: '请选择领取标签' }]}
        fieldProps={{
          onChange: (val) => {
            const tag = tags.find((t) => t.value === val) || null;
            setSelectedTag(tag);
          },
        }}
      />

      {/* 领取数量 */}
      <ProFormDigit
        name="count"
        label="领取数量"
        min={1}
        width="lg"
        fieldProps={{ precision: 0 }} // 只允许整数
        rules={[{ required: true, message: '请输入领取数量' }]}
      />
    </ModalForm>
  );
};

export default ClaimCustomerModal;
