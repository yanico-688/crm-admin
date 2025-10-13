import DeleteButton from '@/components/DeleteButton';
import ModalFormWrapper from '@/pages/Customer/PendingCustomer/components/CreateOrUpdate';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { EditOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { useAccess, useLocation } from '@umijs/max';
import { Button, message, Modal, Popconfirm, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import BatchCreate from './components/BatchCreate';

type PendingCustomer = {
  isDup: boolean;
  isDuplicate: string;
  _id?: string;
  status: '待合作' | '已合作';
  contact: string;
  informChatGPT5: boolean;
  chatGPTReplyTags: string[];
  totalFee: number;
  settledFee: number;
  unsettledFee: number;
  firstCommission: number;
  followUpCommission: number;
  publishDate: string;
  website: string;
  owner: string;
  remark?: string;
};

const STATUS_COLOR_MAP: Record<string, string> = {
  待合作: 'green',
  确认放弃: 'red',
};
const API_PATH = '/pendingCustomer';

const handleAdd = async (fields: PendingCustomer) => {
  const hide = message.loading('正在添加...');
  try {
    await addItem(API_PATH, { ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '添加失败，请重试！');
    return false;
  }
};

const handleUpdate = async (fields: PendingCustomer) => {
  const hide = message.loading('正在更新...');
  try {
    await updateItem(`${API_PATH}/${fields._id}`, fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '更新失败，请重试！');
    return false;
  }
};

const handleRemove = async (ids: string[]) => {
  const hide = message.loading('正在删除...');
  if (!ids) return true;
  try {
    await removeItem(`${API_PATH}/delete-multiple`, { ids });
    hide();
    message.success('删除成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '删除失败，请重试！');
    return false;
  }
};

const TableList: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<PendingCustomer>();
  const [selectedRows, setSelectedRows] = useState<PendingCustomer[]>([]);
  const [batchCreateOpen, setBatchCreateOpen] = useState(false);
  const location = useLocation();

  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
  const handleBatchAbandon = async () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择数据');
      return;
    }

    try {
      const ids = selectedRows.map((row) => row._id);
      const res = await addItem(`${API_PATH}/batchAbandonPending`, { ids });
      if (res.success) {
        message.success(res.message || '操作成功');
        setSelectedRows([]); // 清空选择
        actionRef.current?.reload?.(); // 刷新表格
      } else {
        message.error(res.message || '操作失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求出错');
    }
  };
  const baseColumns: ProColumns<PendingCustomer>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index', // ✅ ProTable 专用，会自动生成序号
      width: 60,
      align: 'center',
    },

    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={STATUS_COLOR_MAP[record.status] || 'default'}>{record.status}</Tag>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      sorter: true,
      width: 200,
      render: (_, record) =>
        Array.isArray(record.contact)
          ? record.contact.map((c, index) => {
              const colors = [
                'blue',
                'purple',
                'magenta',
                'cyan',
                'volcano',
                'orange',
                'volcano',
                'green',
              ];
              const color = colors[index % colors.length];
              return (
                <span key={c} style={{ display: 'inline-block', marginRight: 4, marginBottom: 4 }}>
                  <Tag color={color}>{c}</Tag>
                </span>
              );
            })
          : record.contact,
    },
    {
      title: '重复',
      dataIndex: 'isDup',
      hideInSearch: true, // 不用在搜索里
      render: (_, record) =>
        record.isDup ? <Tag color="red">重复</Tag> : <Tag color="green">唯一</Tag>,
    },
    {
      title: '首单佣金',
      dataIndex: 'firstCommission',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '后续佣金',
      dataIndex: 'followUpCommission',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '预计发布',
      dataIndex: 'publishDate',
      hideInSearch: true,
      valueType: 'date',
      sorter: true,
      render: (_, record) => {
        if (!record.publishDate) return '-';
        const isExpired = dayjs(record.publishDate).isBefore(dayjs(), 'day');
        return (
          <span style={{ color: isExpired ? 'red' : 'inherit' }}>
            {dayjs(record.publishDate).format('YYYY-MM-DD')}
            {isExpired && '（已过期）'}
          </span>
        );
      },
    },
    { title: '本次稿费（万）', dataIndex: 'thisFee', hideInSearch: true, sorter: true },
    { title: '负责人', dataIndex: 'owner'  },
    { title: '备注', dataIndex: 'remark' },
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
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            setUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <EditOutlined /> 编辑
        </a>,
        <Popconfirm
          title="确定要将该客户标记为待合作吗？"
          okText="确认"
          key="confirm"
          cancelText="取消"
          onConfirm={async () => {
            try {
              await addItem(`${API_PATH}/${record._id}/addActive`, {});
              message.success('操作成功');
              actionRef.current?.reload();
            } catch (err: any) {
              message.error(err.response?.data?.message || '操作失败');
            }
          }}
        >
          <Button
            key="send"
            type="primary"
            size="small"
            shape="round"
            ghost
            style={{
              borderColor: '#1890ff',
              color: '#1890ff',
              backgroundColor: 'transparent',
              padding: '0 12px',
              cursor: 'pointer',
            }}
          >
            已合作
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<PendingCustomer>
        actionRef={actionRef}
        rowKey="_id"
        pagination={{
          showSizeChanger: true, // 显示“每页数量”下拉
          showQuickJumper: true, // 显示页码跳转
          defaultPageSize: 20, // 默认每页 10 条
          pageSizeOptions: [5, 10, 20, 50, 100], // 自定义可选条数
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 1200 }}
        search={{ labelWidth: 120, collapsed: false }}
        toolBarRender={() => [
          // <Button
          //   type="primary"
          //   key=""
          //   onClick={() => setCreateModalOpen(true)}
          //   icon={<PlusOutlined />}
          // >
          //   新建
          // </Button>,
          // access.canAdmin && (
          //   <Button key="batch" onClick={() => setBatchCreateOpen(true)}>
          //     批量导入
          //   </Button>
          // ),
          selectedRows?.length > 0 && (
            <Button
              key=""
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认操作',
                  content: `确定要放弃这 ${selectedRows.length} 条记录吗？`,
                  okText: '确认放弃',
                  cancelText: '取消',
                  okType: 'danger',
                  onOk: () => handleBatchAbandon(),
                });
              }}
            >
              批量放弃
            </Button>
          ),
          selectedRows.length > 0 && access.canSuperAdmin && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRows.map((item) => item._id!) as any);
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          ),
        ]}
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
        columns={baseColumns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
      />
      {selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> 项
            </div>
          }
        />
      )}

      <ModalFormWrapper
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            setCreateModalOpen(false);
            actionRef.current?.reload();
          }
          return success;
        }}
        title="新建合作登记"
      />

      <ModalFormWrapper
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        onFinish={async (value) => {
          const success = await handleUpdate({ ...currentRow, ...value });
          if (success) {
            setUpdateModalOpen(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
          return success;
        }}
        title="编辑合作登记"
        initialValues={currentRow}
      />
      <BatchCreate
        open={batchCreateOpen}
        onOpenChange={setBatchCreateOpen}
        onSuccess={() => {
          setBatchCreateOpen(false);
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default TableList;
