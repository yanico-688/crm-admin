import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Card, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface IArticle {
  publishDate?: string;
  website?: string;
  title?: string;
  thisFee?: number;
  isSettled?: boolean;
  createdAt?: string;
}

const BasicForm: React.FC = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const formRef = useRef<ProFormInstance>();

  return (
    <>
      <ProForm.Group>
        <ProFormSelect
          name="contact"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
          mode="tags"
          width="md"
          placeholder="可输入多个，用回车分隔"
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '已合作', value: '已合作' },
            { label: '长期合作', value: '长期合作' },
          ]}
          rules={[{ required: true, message: '请选择状态' }]}
          width="md"
        />
      </ProForm.Group>

      <ProFormList
        name="articles"
        label="发文信息"
        creatorButtonProps={{
          position: 'bottom',
          creatorButtonText: '新增文章',
          disabled: editingIndex !== null,
        }}
        itemRender={(dom, listMeta) => {
          const { index, record, operation } = listMeta as any;
          const isEditing = editingIndex === index;

          if (!isEditing) {
            return (
              <Card
                size="small"
                style={{ marginBottom: 8 }}
                title={record?.title || `文章 ${index + 1}`}
                extra={<a onClick={() => setEditingIndex(index)}>修改</a>}
              >
                <Space size="middle" wrap>
                  <span>
                    发布日期：
                    {record?.publishDate ? dayjs(record.publishDate).format('YYYY-MM-DD') : '-'}
                  </span>
                  <span>
                    网址：
                    {record?.website ? (
                      <a href={record.website} target="_blank" rel="noopener noreferrer">
                        {record.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </span>
                  <span>关键字：{record?.keywords || '-'}</span>
                  <span>稿费：{record?.thisFee ?? 0} 元</span>
                  <Tag color={record?.isSettled ? 'success' : 'error'}>
                    {record?.isSettled ? '已结算' : '未结算'}
                  </Tag>

                  <span>
                    创建时间：
                    {record?.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                  </span>
                </Space>
              </Card>
            );
          }

          return (
            <Card size="small" style={{ marginBottom: 8 }}>
              {dom.listDom}
              <Space style={{ marginTop: 8 }}>
                <Button type="primary" onClick={() => setEditingIndex(null)}>
                  完成
                </Button>
                <Button
                  onClick={() => {
                    const isNewEmpty =
                      !record?.website &&
                      !record?.title &&
                      !record?.thisFee &&
                      !record?.publishDate;
                    if (isNewEmpty) {
                      operation?.remove(index);
                    }
                    setEditingIndex(null);
                  }}
                >
                  取消
                </Button>
              </Space>
            </Card>
          );
        }}
        onAfterAdd={(_, insertIndex) => setEditingIndex(insertIndex as any)}
        onAfterRemove={(index) => setEditingIndex((prev) => (prev === index ? null : prev))}
      >
        <ProForm.Group>
          <ProFormDatePicker name="publishDate" label="发布日期" width="md" />
          <ProFormText name="website" label="网址" width="md" />
          <ProFormText name="title" label="文章标题" width="md" />
          <ProFormText name="keywords" label="关键字" width="md" /> {/* ✅ 新增 */}
          <ProFormDigit name="thisFee" label="稿费" width="md" />
          <ProFormSwitch name="isSettled" label="是否结算" />
        </ProForm.Group>
      </ProFormList>
      <ProForm.Group>
        <ProFormText name="firstCommission" label="首单佣金（%）" width="md" />
        <ProFormText name="followUpCommission" label="后续佣金（%）" width="md" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText name="owner" label="负责人" width="md" />
        <ProFormTextArea name="remark" label="备注" width="md" />
      </ProForm.Group>

    </>
  );
};

export default BasicForm;
