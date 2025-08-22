import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ModalForm, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import DeleteLink from '@/components/DeleteLink';
import DeleteButton from '@/components/DeleteButton';
import { useAccess } from '@umijs/max';
import CustomerModalForm from '@/pages/Customer/MyCustomer/components/CreateOrUpdate';
import BatchCreate from '@/pages/Customer/MyCustomer/components/BatchCreate';
import { useLocation } from '@@/exports';
import ClaimCustomerModal from '@/pages/Customer/MyCustomer/components/ClaimCustomerForm';

type Option = { label: string; value: string };
export type MyCustomer = {
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

  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
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
    { title: '发邮件时间', dataIndex: 'emailSendTime', valueType: 'date', hideInSearch: true },
    { title: '二次邀约', dataIndex: 'secondInvitation', valueType: 'date', hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      filters: Object.keys(STATUS_MAP).map((key) => ({
        text: STATUS_MAP[key].text,
        value: key,
      })),
      render: (_, record) => {
        const status = STATUS_MAP[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    { title: '负责人员', dataIndex: 'owner', hideInSearch: true },
    {
      title: '客户分类',
      dataIndex: 'cusOpt',
      hideInSearch: true,
      hideInTable: true,
    },
    { title: '备注', dataIndex: 'remark' },
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
            <Button type="primary" key='' onClick={() => setModalOpen(true)}>
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
            Object.entries(filter).forEach(([key, val]) => {
              if (!val) return;
              if (query[key]) {
                query[key] = {
                  $or: [
                    { [key]: { $regex: String(query[key]), $options: 'i' } },
                    { [key]: { $in: val as string[] } },
                  ],
                };
              } else {
                query[key] = val;
              }
            });
            return (await queryList(API_PATH, query, sort)) as any;
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
