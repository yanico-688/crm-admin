import DeleteButton from '@/components/DeleteButton';
import ModalFormWrapper from '@/pages/Customer/PendingCustomer/components/CreateOrUpdate';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { addExcelFilters, remoteFilterDropdown } from '@/utils/tagsFilter';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { request, useAccess, useLocation } from '@umijs/max';
import { Button, message, Tag } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import BatchCreate from './components/BatchCreate';

type PendingCustomer = {
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
  待合作: 'default',
  已合作: 'green',
  确认放弃: 'red',
  长期合作: 'blue',
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
  const [uniqueFilters, setUniqueFilters] = useState<Record<string, string[]>>({});
  const location = useLocation();

  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
  const baseColumns: ProColumns<PendingCustomer>[] = [
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      filters: Object.keys(STATUS_COLOR_MAP).map((k) => ({
        text: k,
        value: k,
      })),
      render: (_, record) => (
        <Tag color={STATUS_COLOR_MAP[record.status] || 'default'}>{record.status}</Tag>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
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
                  {record.isDuplicate && <Tag color="red">重复！</Tag>}
                </span>
              );
            })
          : record.contact,
    },

    {
      title: '首单佣金',
      dataIndex: 'firstCommission',
      hideInSearch: true,
    },
    {
      title: '后续佣金',
      dataIndex: 'followUpCommission',
      hideInSearch: true,
    },
    { title: '预计发布', dataIndex: 'publishDate', hideInSearch: true, valueType: 'date' },
    { title: '本次稿费（万）', dataIndex: 'thisFee', hideInSearch: true },
    { title: '负责人', dataIndex: 'owner', hideInSearch: true },
    { title: '备注', dataIndex: 'remark' },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', hideInSearch: true },
    { title: '修改时间', dataIndex: 'updatedAt', valueType: 'dateTime', hideInSearch: true },
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

              await addItem(`${API_PATH}/${record._id}/addActive`, {});
              message.success('操作成功');
              actionRef.current?.reload();
            } catch (err: any) {
              message.error(err.response?.data?.message || '操作失败');
            }
          }}
        >
          已合作
        </Button>,
      ],
    },
  ];

  useEffect(() => {
    request(`${API_PATH}/unique-filters`).then((res) => {
      if (res.success) setUniqueFilters(res.data);
    });
  }, []);
  // ③ 先给所有“普通字段”加静态筛选（只显示 50 条，内置本地搜）

  const columnsWithStatic = useMemo(
    () => addExcelFilters<PendingCustomer>(baseColumns, uniqueFilters),
    [baseColumns, uniqueFilters],
  );

  // ④ 指定“重字段”切换为远程面板（全量搜索）。其余保持静态筛选。

  const HEAVY_FIELDS = ['website', 'remark', 'contact']; // 例如：候选很多的字段
  const columns: ProColumns<PendingCustomer>[] = useMemo(
    () =>
      columnsWithStatic.map((c) => {
        if (!c.dataIndex || typeof c.dataIndex !== 'string') return c;
        if (!HEAVY_FIELDS.includes(c.dataIndex)) return c;

        const cc: ProColumns<PendingCustomer> = { ...c };
        delete (cc as any).filters;
        delete (cc as any).filterSearch;
        cc.filterMultiple = true; // 保持多选
        cc.filterDropdown = remoteFilterDropdown(
          c.dataIndex,
          `${API_PATH}/unique-filter-values`,
          50,
        );
        return cc;
      }),
    [columnsWithStatic],
  );

  useEffect(() => {
    request(`${API_PATH}/unique-filters`).then((res) => {
      if (res.success) setUniqueFilters(res.data);
    });
  }, []);

  return (
    <PageContainer>
      <ProTable<PendingCustomer>
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 1200 }}
        search={{ labelWidth: 120, collapsed: false }}
        toolBarRender={() => [
          <Button
            type="primary"
            key=""
            onClick={() => setCreateModalOpen(true)}
            icon={<PlusOutlined />}
          >
            新建
          </Button>,
          access.canAdmin && (
            <Button key="batch" onClick={() => setBatchCreateOpen(true)}>
              批量导入
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
          return (await queryList(API_PATH, params, sort)) as any;
        }}
        columns={columns}
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
