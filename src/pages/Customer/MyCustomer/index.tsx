import DeleteButton from '@/components/DeleteButton';
import BatchCreate from '@/pages/Customer/MyCustomer/components/BatchCreate';
import ClaimCustomerModal from '@/pages/Customer/MyCustomer/components/ClaimCustomerForm';
import CustomerModalForm from '@/pages/Customer/MyCustomer/components/CreateOrUpdate';
import { addItem, getList, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { filterBoxStyle, filterDivStyle } from '@/services/ant-design-pro/yanico';
import { useLocation } from '@@/exports';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Badge, Button, Checkbox, message, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

export type MyCustomer = {
  latestEmailSendTime?: Date;
  _id?: string;
  name: string;
  contact: string;
  platformUrl: string;
  emailSendTime: string;
  secondInvitation?: string;
  status: string;
  owner?: string;
  bloggerData?: string; // 图片 URL
  remark?: string;
  inviteHistory: Date[];
};
const API_PATH = '/myCustomers';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  谈判: { color: 'orange', text: '谈判' },
  未回复: { color: 'pink', text: '未回复' },
  已回复: { color: 'purple', text: '已回复' },
};

// 添加
const handleAdd = async (fields: MyCustomer) => {
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

// 更新
const handleUpdate = async (fields: MyCustomer) => {
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

// 删除
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
  const location = useLocation();
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [batchCreateOpen, setBatchCreateOpen] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<MyCustomer>();
  const [selectedRowsState, setSelectedRows] = useState<MyCustomer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    谈判: 0,
    未回复: 0,
    已回复: 0,
  });

  // 初始化统计数量
  useEffect(() => {
    getList(`${API_PATH}/statusCounts`).then((res) => {
      setStatusCounts(res.data as any); // 后端返回 { 谈判: 10, 未回复: 20, 已回复: 5 }
    });
  }, []);
  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
  const [ownerFilters, setOwnerFilters] = useState<{ text: string; value: string }[]>([]);

  useEffect(() => {
    getList('/myCustomers/owners').then((res) => {
      if (res.success) {
        setOwnerFilters(res.data.map((o: string) => ({ text: o, value: o })));
      }
    });
  }, []);

  const baseColumns: ProColumns<MyCustomer>[] = [
    { title: '姓名', dataIndex: 'name' },
    {
      title: '联系方式',
      dataIndex: 'contact',
      copyable: true,
    },

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
      title: '最新发邮件时间',
      dataIndex: 'latestEmailSendTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },

    {
      title: '邀约记录',
      dataIndex: 'inviteHistory',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.inviteHistory || record.inviteHistory.length === 0) {
          return '-';
        }
        return (
          <div>
            {record.inviteHistory.map((time: Date | string, index: number) => (
              <Tag key={index} color="blue">
                {dayjs(time).format('YYYY-MM-DD HH:mm:ss')}
              </Tag>
            ))}
          </div>
        );
      },
    },

    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        const status = STATUS_MAP[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '负责人员',
      dataIndex: 'owner',
      hideInSearch: true,
      filters: ownerFilters,
      filterMode: 'menu',
    },
    {
      title: '客户分类',
      dataIndex: 'cusOpt',
      hideInSearch: true,
      hideInTable: true,
    },
    { title: '备注', dataIndex: 'remark' },
    { title: '修改时间', dataIndex: 'updatedAt', valueType: 'dateTime', sorter: true },
    {
      title: '操作',
      width: 220,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastSend = record.latestEmailSendTime
          ? new Date(record.latestEmailSendTime).setHours(0, 0, 0, 0)
          : null;
        const disabled = lastSend && lastSend === today;

        return [
          <a
            key="update"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            <EditOutlined /> 编辑
          </a>,
          <Button
            key="send"
            type="primary"
            size="small"
            shape="round"
            ghost
            disabled={disabled as any}
            style={{
              borderColor: disabled ? '#d9d9d9' : '#1890ff',
              color: disabled ? '#bfbfbf' : '#1890ff',
              backgroundColor: disabled ? '#f5f5f5' : 'transparent',
              padding: '0 12px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.8 : 1,
            }}
            onClick={async () => {
              if (disabled) return;
              try {
                const res = await addItem(`/myCustomers/${record._id}/sendInvitation`, {});
                if (res.success) {
                  message.success('发送成功');
                  actionRef.current?.reload();
                } else {
                  message.error(res.message || '发送失败');
                }
              } catch (err: any) {
                message.error(err.response?.data?.message || '发送失败');
              }
            }}
          >
            发送
          </Button>,
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
            onClick={async () => {
              try {
                await addItem(`/myCustomers/${record._id}/addPending`, {});
                message.success('操作成功');
                actionRef.current?.reload();
              } catch (err: any) {
                message.error(err.response?.data?.message || '操作失败');
              }
            }}
          >
            待合作
          </Button>,
        ];
      },
    },
  ];

  return (
    <>
      <ClaimCustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setModalOpen(false);
          actionRef.current?.reload();
        }}
      />
      <PageContainer>
        {/* ✅ 状态筛选器 */}
        <div style={filterDivStyle}>
          <div style={filterBoxStyle}>
            <span style={{ marginRight: 8 }}>状态筛选：</span>
            {/* 全部 */}
            <Checkbox
              checked={statusFilter.length === 0} // 没有筛选时代表全部
              onChange={(e) => {
                if (e.target.checked) {
                  setStatusFilter([]); // 清空筛选，显示全部
                }
                actionRef.current?.reload();
              }}
              style={{ marginRight: 8 }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                全部
                <Badge
                  count={statusCounts.全部 || 0}
                  style={{ backgroundColor: '#ff4d4f' }}
                  overflowCount={9999}
                  offset={[-5, -20]}
                />
              </span>
            </Checkbox>
            {Object.keys(STATUS_MAP).map((key) => (
              <Checkbox
                key={key}
                checked={statusFilter.includes(key)}
                onChange={(e) => {
                  const newFilter = e.target.checked
                    ? [...statusFilter, key]
                    : statusFilter.filter((k) => k !== key);
                  setStatusFilter(newFilter);
                  actionRef.current?.reload(); // 刷新表格
                }}
                style={{ marginRight: 8 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {STATUS_MAP[key].text}
                  <Badge
                    count={statusCounts[key]}
                    style={{ backgroundColor: '#ff4d4f' }}
                    overflowCount={9999}
                    offset={[-5, -20]}
                  />
                </span>
              </Checkbox>
            ))}
          </div>
        </div>
        <ProTable<MyCustomer, API.PageParams>
          actionRef={actionRef}
          rowKey="_id"
          pagination={{
            showSizeChanger: true, // 显示“每页数量”下拉
            showQuickJumper: true, // 显示页码跳转
            pageSize: 20, // 默认每页 10 条
            pageSizeOptions: [5, 10, 20, 50, 100], // 自定义可选条数
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
          search={{ labelWidth: 120, collapsed: false }}
          toolBarRender={() => [
            <Button type="primary" key="" onClick={() => setModalOpen(true)}>
              领取客户
            </Button>,
            access.canAdmin && (
              <Button type="primary" key="primary" onClick={() => handleModalOpen(true)}>
                <PlusOutlined /> 新建
              </Button>
            ),
            access.canAdmin && (
              <Button key="batch" onClick={() => setBatchCreateOpen(true)}>
                批量导入
              </Button>
            ),
            selectedRowsState?.length > 0 && access.canSuperAdmin && (
              <DeleteButton
                onOk={async () => {
                  await handleRemove(selectedRowsState?.map((item) => item._id!) as any);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                }}
              />
            ),
          ]}
          request={async (params, sort, filter) => {
            const query: Record<string, any> = { ...params };

            // ✅ 状态筛选
            if (statusFilter.length > 0) {
              query.status = statusFilter;
            }

            // ✅ 负责人员筛选（filter 传过来的值）
            if (filter.owner) {
              query.owner = filter.owner;
            }

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
            onChange: (_, selectedRows) => setSelectedRows(selectedRows as any),
          }}
        />

        {selectedRowsState?.length > 0 && (
          <FooterToolbar
            extra={
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
              </div>
            }
          />
        )}

        <CustomerModalForm
          isNew
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            const success = await handleAdd(value as MyCustomer);
            if (success) {
              handleModalOpen(false);
              actionRef.current?.reload();
            }
          }}
        />

        <CustomerModalForm
          open={updateModalOpen}
          onOpenChange={handleUpdateModalOpen}
          initialValues={currentRow}
          onFinish={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            }
          }}
        />
        <BatchCreate
          open={batchCreateOpen}
          onOpenChange={setBatchCreateOpen}
          onSuccess={() => {
            setBatchCreateOpen(false);
            actionRef.current?.reload();
          }}
        />
      </PageContainer>{' '}
    </>
  );
};

export default TableList;
