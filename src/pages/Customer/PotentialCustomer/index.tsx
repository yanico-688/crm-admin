import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Image, message, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import DeleteLink from '@/components/DeleteLink';
import DeleteButton from '@/components/DeleteButton';
import { useAccess } from '@umijs/max';
import CustomerModalForm from '@/pages/Customer/PotentialCustomer/components/CreateOrUpdate';
import BatchCreate from '@/pages/Customer/PotentialCustomer/components/BatchCreate';

export type PotentialCustomer = {
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
};

const API_PATH = '/potentialCustomers';

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  已合作: { color: 'green', text: '已合作' },
  待合作: { color: 'blue', text: '待合作' },
  谈判: { color: 'orange', text: '谈判' },
  未回复: { color: 'default', text: '未回复' },
  确认放弃: { color: 'red', text: '确认放弃' },
  邮箱错的: { color: 'purple', text: '邮箱错的' },
  长期合作: { color: 'cyan', text: '长期合作' },
};

// 添加
const handleAdd = async (fields: PotentialCustomer) => {
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
const handleUpdate = async (fields: PotentialCustomer) => {
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
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [batchCreateOpen, setBatchCreateOpen] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<PotentialCustomer>();
  const [selectedRowsState, setSelectedRows] = useState<PotentialCustomer[]>([]);
  const access = useAccess();

  const columns: ProColumns<PotentialCustomer>[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '联系方式', dataIndex: 'contact', copyable: true },
    {
      title: '平台网址',
      dataIndex: 'platformUrl',
      render: (_, record) =>
        <a href={record.platformUrl} target="_blank" rel="noopener noreferrer">
          {record.platformUrl}
        </a>
    }
,

    { title: '发邮件时间', dataIndex: 'emailSendTime', valueType: 'date', hideInSearch: true },
    { title: '二次邀约', dataIndex: 'secondInvitation', valueType: 'date', hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',hideInSearch:true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch
            placeholder="选择状态"
            value={selectedKeys[0]}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            style={{ width: 160 }}
            options={Object.keys(STATUS_MAP).map(key => ({
              label: STATUS_MAP[key].text,
              value: key,
            }))}
          />
          <Space style={{ marginTop: 8 }}>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const status = STATUS_MAP[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    }
,
    { title: '负责人员', dataIndex: 'owner', hideInSearch: true },
    {
      title: '博主数据',
      dataIndex: 'bloggerData',
      hideInSearch: true,
      render: (val) => val&&val!=='-' ?
        <Image width={60} src={`${process.env.UMI_APP_API_URL?process.env.UMI_APP_API_URL:''}api${val?val:''}`} />
         : '-',
    }
    ,

    { title: '备注', dataIndex: 'remark', ellipsis: true, hideInSearch: true },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <EditOutlined /> 编辑
        </a>,
        access.canSuperAdmin && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<PotentialCustomer, API.PageParams>
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
        request={async (params, sort, filter) => queryList(API_PATH, params, sort, filter) as any}
        columns={columns}
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
          const success = await handleAdd(value as PotentialCustomer);
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

    </PageContainer>
  );
};

export default TableList;
