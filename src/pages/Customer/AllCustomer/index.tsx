import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { useLocation } from '@@/exports';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CustomerForm from './components/CustomerForm';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  可领取: { color: 'green', text: '可领取' },
  已被领取: { color: 'pink', text: '已被领取' },
  被打回: { color: 'blue', text: '被打回' },
  确认错误: { color: 'red', text: '确认错误' },
};
const API_PATH = '/allCustomers';
const AllCustomersPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const location = useLocation();

  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
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
      hideInSearch: true,
      filters: Object.keys(STATUS_MAP).map((key) => ({
        text: STATUS_MAP[key].text,
        value: key,
      })),
      render: (_, record) => {
        const statusItem = STATUS_MAP[record.status] || {};
        return <Tag color={statusItem.color}>{statusItem.text}</Tag>;
      },
    },

    {
      title: '不可领取',
      dataIndex: 'blockedOwners',
      render: (_, record) => {
        if (!record.blockedOwners || record.blockedOwners.length === 0) {
          return '-';
        }
        return (
          <>
            {record.blockedOwners.map((owner: string, index: number) => (
              <Tag key={index} color="blue">
                {owner}
              </Tag>
            ))}
          </>
        );
      },
    },
    { title: '标签', dataIndex: 'tags' },
    { title: '来源', dataIndex: 'from' },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '修改时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
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
        request={async (params, sort) => {
          const query: Record<string, any> = {
            ...params, // ✅ 包含 current / pageSize
          };
          // ✅ 排序
          if (sort && Object.keys(sort).length > 0) {
            const [field, order] = Object.entries(sort)[0];
            query.sortField = field;
            query.sortOrder = order; // ascend / descend
          }
          return (await queryList(API_PATH, query)) as any;
        }}
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
          const hide = message.loading('操作中...');
          try {
            const success = val._id
              ? await updateItem(`${API_PATH}/${val._id}`, val)
              : await addItem(API_PATH, { ...val });
            hide();
            setModalOpen(false);
            actionRef.current?.reload();
            message.success('操作成功');
            return true;
          } catch (error: any) {
            hide();
            message.error(error?.response?.data?.message ?? '添加失败，请重试！');
            return false;
          }
        }}
      />
    </PageContainer>
  );
};
export default AllCustomersPage;
