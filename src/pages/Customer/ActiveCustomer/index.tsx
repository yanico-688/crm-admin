import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ModalFormWrapper from '@/pages/Customer/ActiveCustomer/components/CreateOrUpdate';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { useLocation } from '@@/exports';
import { CopyOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, message, Popconfirm, Tag } from 'antd';
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import BatchCreate from './components/BatchCreate';

type ActiveCustomer = {
  createdAt: string;
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
  const location = useLocation();
  const [summary, setSummary] = useState<{ settledFee: number; unsettledFee: number }>({
    settledFee: 0,
    unsettledFee: 0,
  });
  const [sentCount, setSentCount] = useState(0);
  // 监听路由变化
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [location.pathname]);
  const baseColumns: ProColumns<ActiveCustomer>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index', // ✅ ProTable 专用，会自动生成序号
      width: 60,
      align: 'center',
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
              const handleCopy = () => {
                copy(c);
                message.success(`已复制：${c}`);
              };
              return (
                <span key={c} style={{ display: 'inline-block', marginRight: 4, marginBottom: 4 }}>
                  <Tag color={color}>{c}</Tag>
                  <CopyOutlined
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={handleCopy}
                  />
                  {record.isDuplicate && <Tag color="red">重复！</Tag>}
                </span>
              );
            })
          : record.contact,
    },
    {
      title: '总稿费（万）',
      dataIndex: 'totalFee', // ✅ 关键：让它成为一个真正的字段，支持搜索
      valueType: 'digit', // ✅ 数字输入框
      render: (_, record) => (record.totalFee ? record.totalFee.toFixed(2) : '0.00'),
    },

    {
      title: '发文数',
      hideInSearch: true,
      render: (_, record) => (record.articles ? record.articles.length : 0),
    },
    {
      title: '未发数',
      dataIndex: 'hasUnsettled',
      valueType: 'select',
      valueEnum: {
        true: { text: '有未发文' },
        false: { text: '无未发文' },
      },
      render: (_, record) =>
        record.articles ? record.articles.filter((item) => item.isSettled === false).length : 0,
    },

    {
      title: '发文日期',
      dataIndex: 'publishDate',
      valueType: 'dateRange', // 启用区间选择
      hideInTable: true,
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            startDate: value[0],
            endDate: value[1],
          };
        },
      },
      render: (_, record) => record.publishDate || '-',
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
      valueType: 'dateRange', // ✅ 使用区间筛选
      search: {
        transform: (value) => {
          // value 是一个 [start, end] 数组
          return {
            firstStartDate: value[0],
            firstEndDate: value[1],
          };
        },
      },
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
        const len = record.articles?.length - 1;
        return record.articles?.[len].publishDate;
      },
    },

    { title: '负责人', dataIndex: 'owner' },
    { title: '备注', dataIndex: 'remark' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange', // ✅ 使用区间筛选
      search: {
        transform: (value) => {
          // value 是一个 [start, end] 数组
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
      render: (_, record) =>
        record.createdAt && dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '文章关键字',
      dataIndex: 'articleKeyword',
      hideInTable: true,
    }
    ,
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
  const handleExport = async () => {
    const res = await queryList(API_PATH, {
      current: 1,
      pageSize: 99999,
    });

    // 👇 就是你想要的：定义 ActiveCustomer[]
    const data = res.data as {
      _id?: string;
      contact: string | string[];
      articles: Array<{ publishDate: string; isSettled: boolean }>;
      totalFee: number;
      settledFee: number;
      unsettledFee: number;
      firstCommission: number;
      followUpCommission: number;
      publishDate: string;
      website: string;
      owner: string;
      remark?: string;
      createdAt: string;
      updatedAt: string;
      status: '待合作' | '已合作';
      isDuplicate: string;
      informChatGPT5: boolean;
      chatGPTReplyTags: string[];
    }[];

    if (!data || data.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    const header = [
      '联系方式',
      '总稿费（万）',
      '发文数',
      '未发数',
      '首单佣金（%）',
      '后续佣金（%）',
      '初始发布',
      '最新发布',
      '负责人',
      '备注',
      '创建时间',
      '修改时间',
    ];

    const rows = data.map((item: any) => {
      const articleCount = item.articles?.length || 0;
      const unsettledCount = item.articles?.filter((a:any) => !a.isSettled).length || 0;
      const firstPublish = articleCount > 0 ? item.articles[0].publishDate : '';
      const latestPublish = articleCount > 0 ? item.articles[articleCount - 1].publishDate : '';

      return [
        Array.isArray(item.contact) ? item.contact.join('; ') : item.contact || '',
        item.totalFee ? (item.totalFee).toFixed(2) : '0.00',
        articleCount,
        unsettledCount,
        item.firstCommission ?? '',
        item.followUpCommission ?? '',
        firstPublish ? dayjs(firstPublish).format('YYYY-MM-DD') : '',
        latestPublish ? dayjs(latestPublish).format('YYYY-MM-DD') : '',
        item.owner || '',
        (item.remark || '').replace(/\n/g, ' '),
        item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
        item.updatedAt ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
      ];
    });

    const csvContent =
      '\uFEFF' +
      [header, ...rows]
        .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `已合作客户列表_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
          <Popconfirm
            key="export"
            title="确认导出全部数据？"
            onConfirm={handleExport}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary">导出数据</Button>
          </Popconfirm>,
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
          setSummary(res.summary ?? { settledFee: 0, unsettledFee: 0 });
          setSentCount(res.sentCount);
          return res;
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
        <span style={{ marginRight: 24 }}>
          未结稿费（万）：<b>{summary.unsettledFee ?? 0}</b>
        </span>
        <span style={{ marginRight: 24 }}>
          发文数 ：<b>{sentCount ?? 0}</b>
        </span>
      </div>
    </PageContainer>
  );
};

export default TableList;
