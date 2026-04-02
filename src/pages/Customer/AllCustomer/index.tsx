import CopyToClipboard from '@/components/CopyToClipboard';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { useAccess, useLocation } from '@@/exports';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CustomerForm from './components/CustomerForm';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  可领取: { color: 'green', text: '可领取' },
  已被领取: { color: '#40a9ff', text: '已被领取' },
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
  const access = useAccess();
  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 80,
    },
    { title: '联系方式', dataIndex: 'contact', copyable: true, sorter: true, width: 200 },
    {
      title: '平台网址',
      dataIndex: 'platformUrl',
      sorter: true,
      width: 300,
      render: (_, record) =>
        Array.isArray(record.platformUrl)
          ? record.platformUrl.map((c: string, index: number) => {
            const colors = [
              'blue',
              'purple',
              'magenta',
              'cyan',
              'volcano',
            ];
            const color = colors[index % colors.length];

            return (
              <span
                key={c + index}
                style={{ display: 'inline-block', marginRight: 4, marginBottom: 4 }}
              >
              <a
                href={c}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: 6 }}
              >
                <Tag color={color}>{c}</Tag>
              </a>
              <CopyToClipboard text={c} />
            </span>
            );
          })
          : record.platformUrl && (
          <a
            href={record.platformUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
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
      valueType: 'select', // ✅ 搜索时显示为下拉框
      valueEnum: {
        已被领取: { text: '已被领取' },
        被打回: { text: '被打回' },
        确认错误: { text: '确认错误' },
        可领取: { text: '可领取' },
      },
    },

    {
      title: '领取人',
      dataIndex: 'owner',
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
    { title: '备注', dataIndex: 'remark', width: 100 },

    {
      title: '打回时间',
      dataIndex: 'backAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '最后状态',
      dataIndex: 'lastContactStatus',
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '可领取', value: '可领取' },
          { label: '已被领取', value: '已被领取' },
          { label: '被打回', value: '被打回' },
          { label: '确认错误', value: '确认错误' },
          { label: '未发送', value: '未发送' },
          { label: '未回复', value: '未回复' },
          { label: '已回复', value: '已回复' },
          { label: '谈判', value: '谈判' },
          { label: '待合作', value: '待合作' },
          { label: '已合作', value: '已合作' },
          { label: '长期合作', value: '长期合作' },
          { label: '已放弃', value: '已放弃' },
        ],
      },
      render: (_, record) => {
        const statusColorMap: Record<string, string> = {
          可领取: 'green',
          已被领取: 'processing',
          被打回: 'blue',
          确认错误: 'red',
          未发送: 'default',
          未回复: 'orange',
          已回复: 'purple',
          谈判: 'gold',
          待合作: 'cyan',
          已合作: 'success',
          长期合作: 'processing',
          已放弃: 'volcano',
        };

        const text = record.lastContactStatus || '-';
        return <Tag color={statusColorMap[text] || 'default'}>{text}</Tag>;
      },
    },
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
        search={{ labelWidth: 120, collapsed: false }}
        rowSelection={{
          onChange: (_, selected) => setSelectedRows(selected),
        }}
        pagination={{
          defaultPageSize: 20,
          pageSizeOptions: ['20', '50', '100', '500', '1000'],
          showSizeChanger: true,
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
          selectedRows.length > 0 && access.canSuperAdmin && (
            <Popconfirm
              key="batchWrong"
              title={`确认错误选中的 ${selectedRows.length} 条数据？`}
              onConfirm={async () => {
                await addItem(`${API_PATH}/batchWrong`, {
                  ids: selectedRows.map((r) => r._id),
                });
                setSelectedRows([]);
                actionRef.current?.reload();
              }}
            >
              <Button danger >批量确认错误</Button>
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
