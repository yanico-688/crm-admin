import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { queryList, addItem, updateItem, removeItem } from '@/services/ant-design-pro/api';
import CustomerForm from './components/CustomerForm';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  可领取: { color: 'green', text: '可领取' },
  已被领取: { color: 'pink', text: '已被领取' },
  被打回: { color: 'blue', text: '被打回' },
};
const API_PATH = '/allCustomers';
const AllCustomersPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const columns: ProColumns<any>[] = [
    { title: '联系方式', dataIndex: 'contact', copyable: true },
    {
      title: '平台网址',
      dataIndex: 'platformUrl',
      render: (_, record) => (
        <a href={record.platformUrl} target="_blank" rel="noopener noreferrer">
          {record.platformUrl}
        </a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        const statusItem = STATUS_MAP[record.status] || {};
        return <Tag color={statusItem.color}>{statusItem.text}</Tag>;
      },
    },
    { title: '标签', dataIndex: 'tags' },
    { title: '备注', dataIndex: 'remark', ellipsis: true },

    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setModalOpen(true);
          }}
        >
          修改
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该客户？"
          onConfirm={async () => {
            await removeItem(`${API_PATH}/delete-multiple`, { ids: [record._id] });
            actionRef.current?.reload();
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        rowKey="_id"
        actionRef={actionRef}
        columns={columns}
        rowSelection={{
          onChange: (_, selected) => setSelectedRows(selected),
        }}
        request={(params) => queryList(API_PATH, params)}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setModalOpen(true);
            }}
          >
            新建
          </Button>,
          selectedRows.length > 0 && (
            <Popconfirm
              key="batchDelete"
              title={`确认删除选中的 ${selectedRows.length} 条数据？`}
              onConfirm={async () => {
                await removeItem(`${API_PATH}/delete-multiple`, {
                  ids: selectedRows.map((r) => r._id),
                });
                setSelectedRows([]);
                actionRef.current?.reload();
              }}
            >
              <Button danger>批量删除</Button>
            </Popconfirm>
          ),
        ]}
      />

      <CustomerForm
        open={modalOpen}
        onOpenChange={setModalOpen}
        values={currentRow}
        onFinish={async (val: any) => {
          const success = val._id
            ? await updateItem(`${API_PATH}/${val._id}`, val)
            : await addItem(API_PATH, { ...val });
          if (success) {
            setModalOpen(false);
            actionRef.current?.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default AllCustomersPage;
