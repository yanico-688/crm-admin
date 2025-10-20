import { addItem, getItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
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
    { title: '联系方式', dataIndex: 'contact', copyable: true, sorter: true, width: 180 },
    // {
    //   title: '重复',
    //   dataIndex: 'isDup',
    //   hideInSearch: true, // 不用在搜索里
    //   render: (_, record) =>
    //     record.isDup ? <Tag color="red">重复</Tag> : <Tag color="green">唯一</Tag>,
    // },
    {
      title: '平台网址',
      dataIndex: 'platformUrl',
      width: 150,
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
          <Button
            key="matchOwner"
            onClick={async () => {
              const key = 'matchOwnerProgress';
              let timer: any;
              try {
                // 1) 启动任务（POST）
                const startRes = await addItem(`${API_PATH}/matchOwners/start`, {});
                if (!startRes?.success) {
                  message.error(startRes?.message || '任务启动失败');
                  return;
                }

                // 2) 开始显示持久提示
                message.open({
                  type: 'loading',
                  content: '任务已启动，正在分批匹配领取人...',
                  key,
                  duration: 0,
                });

                // 3) 轮询进度
                const poll = async () => {
                  const res = await getItem(`${API_PATH}/matchOwners/progress`);
                  // 兼容不同返回形状：{ success, data: {...} } 或直接 {...}
                  const progress = res?.data ?? res;
                  const { total = 0, processed = 0, running = false } = progress || {};
                  const percent = total ? ((processed / total) * 100).toFixed(1) : '0.0';

                  message.open({
                    type: 'loading',
                    content: `正在匹配领取人... 已完成 ${processed}/${total} (${percent}%)`,
                    key,
                    duration: 0,
                  });

                  if (!running) {
                    clearInterval(timer);
                    message.open({
                      type: 'success',
                      content: `匹配完成，共处理 ${processed} 条`,
                      key,
                      duration: 4,
                    });
                    actionRef.current?.reload();
                  }
                };

                // 先拉一次，马上看到数字
                await poll();
                // 再每秒轮询
                timer = setInterval(poll, 1000);
              } catch (e: any) {
                clearInterval(timer);
                message.open({
                  type: 'error',
                  content: e?.message || '请求出错',
                  key,
                  duration: 5,
                });
              }
            }}
          >
            一键匹配领取人
          </Button>
,
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
