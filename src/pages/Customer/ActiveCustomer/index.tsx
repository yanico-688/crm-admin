import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ModalFormWrapper from '@/pages/Customer/ActiveCustomer/components/CreateOrUpdate';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { addExcelFilters, remoteFilterDropdown } from '@/utils/tagsFilter';
import { useLocation } from '@@/exports';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { request, useAccess } from '@umijs/max';
import { Button, message, Tag } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import BatchCreate from './components/BatchCreate';

type ActiveCustomer = {
  articles: any[];
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
const TAG_COLOR_MAP: Record<string, string> = {
  放弃: 'default',
  加评论: 'purple',
  拒绝: 'red',
  发文章: 'blue',
  已完成: 'green',
};
const API_PATH = '/activeCustomer';

const handleAdd = async (fields: ActiveCustomer) => {
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

const handleUpdate = async (fields: ActiveCustomer) => {
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
  const [currentRow, setCurrentRow] = useState<ActiveCustomer>();
  const [selectedRows, setSelectedRows] = useState<ActiveCustomer[]>([]);
  const [batchCreateOpen, setBatchCreateOpen] = useState(false);
  const [uniqueFilters, setUniqueFilters] = useState<Record<string, string[]>>({});
  const location = useLocation();

  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
  const baseColumns: ProColumns<ActiveCustomer>[] = [
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
      title: '总稿费（万）',
      hideInSearch: true,
      render: (_, record) => {
        const total = (record.articles || []).reduce(
          (sum: number, item: any) => sum + (item.thisFee || 0),
          0,
        );
        return total.toFixed(2);
      },
    },
    {
      title: '发文数',
      hideInSearch: true,
      render: (_, record) => (record.articles ? record.articles.length : 0),
    },

    {
      title: '首单佣金（%）',
      dataIndex: 'firstCommission',
      hideInSearch: true,
    },
    {
      title: '后续佣金（%）',
      dataIndex: 'followUpCommission',
      hideInSearch: true,
    },
    {
      title: '初始发布',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.articles?.length) return '-';
        return record.articles?.[0].publishDate;
      },
    },
    {
      title: '最新发布',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.articles?.length) return '-';
        const len=record.articles?.length-1;
        return record.articles?.[len].publishDate;
      },
    },

    { title: '负责人', dataIndex: 'owner'  },
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
  const [summary, setSummary] = useState<{ settledFee: number; unsettledFee: number }>({
    settledFee: 0,
    unsettledFee: 0,
  });

  useEffect(() => {
    request(`${API_PATH}/unique-filters`).then((res) => {
      if (res.success) setUniqueFilters(res.data);
    });
  }, []);
  // ③ 先给所有“普通字段”加静态筛选（只显示 50 条，内置本地搜）

  const columnsWithStatic = useMemo(
    () => addExcelFilters<ActiveCustomer>(baseColumns, uniqueFilters),
    [baseColumns, uniqueFilters],
  );

  // ④ 指定“重字段”切换为远程面板（全量搜索）。其余保持静态筛选。

  const HEAVY_FIELDS = ['website', 'remark', 'contact']; // 例如：候选很多的字段
  const columns: ProColumns<ActiveCustomer>[] = useMemo(
    () =>
      columnsWithStatic.map((c) => {
        if (!c.dataIndex || typeof c.dataIndex !== 'string') return c;
        if (!HEAVY_FIELDS.includes(c.dataIndex)) return c;

        const cc: ProColumns<ActiveCustomer> = { ...c };
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
      <ProTable<ActiveCustomer>
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

          // 1. 请求表格数据
          const res = (await queryList(API_PATH, query, sort)) as any;
          setSummary(res.summary?.[0] ?? { settledFee: 0, unsettledFee: 0 });
          return res;
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
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#fafafa',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <span style={{ marginRight: 24 }}>
          总稿费（万）：<b>{(summary.settledFee ?? 0) + (summary.unsettledFee ?? 0)}</b>
        </span>
        <span style={{ marginRight: 24 }}>
          已结稿费（万）：<b>{summary.settledFee ?? 0}</b>
        </span>
        <span>
          未结稿费（万）：<b>{summary.unsettledFee ?? 0}</b>
        </span>
      </div>
    </PageContainer>
  );
};

export default TableList;
