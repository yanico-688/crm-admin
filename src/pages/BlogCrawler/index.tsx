import React, {useRef, useState} from 'react';
import {Button, message, Tag} from 'antd';
import {addItem, queryList} from '@/services/ant-design-pro/api';
import {type ActionType, PageContainer, ProTable} from "@ant-design/pro-components";
import {useAccess} from "@@/exports";

const BlogCrawler: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const beiyongBtn = async () => {
    setLoading(true);
    try {
      const res = await addItem('/blogs/beiYong',  {
        keyword:'YouTube'
      });
      if (res.success) {
        message.success('操作成功');
      } else {
        message.error(res.message || '同步失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求出错');
    } finally {
      setLoading(false);
    }
  };
  const sync = async (mode: 'full' | 'incremental') => {
    setLoading(true);
    try {
      const res = await addItem('/blogs/updateData', {mode});
      if (res.success) {
        message.success('操作成功');
        // fetchSyncData(); // 同步后刷新列表
        actionRef.current?.reloadAndRest?.();
      } else {
        message.error(res.message || '同步失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求出错');
    } finally {
      setLoading(false);
    }
  };
  const syncSingle = async (collectionName: string, mode: 'full' | 'incremental') => {
    setLoading(true);
    try {
      const res = await addItem('/blogs/updateData', {mode, collectionName});
      if (res.success) {
        message.success(`${collectionName} ${mode === 'full' ? '全量' : '增量'}同步成功`);
        // fetchSyncData();
        actionRef.current?.reloadAndRest?.();
      } else {
        message.error(res.message || '操作失败');
      }
    } catch (err: any) {
      message.error(err?.message || '请求出错');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {title: '集合名', dataIndex: 'collectionName', hideInSearch: true, key: 'collectionName',},
    {
      title: '最后同步时间',
      dataIndex: 'lastSyncTime',
      key: 'lastSyncTime',
      hideInSearch: true,
      render: (val: string) => val ? new Date(val).toLocaleString() : '未同步'
    },
    {
      title: '更新数量',
      dataIndex: 'updatedCount',
      hideInSearch: true,
      key: 'updatedCount'
    },
    {
      title: '模式',
      dataIndex: 'mode',
      hideInSearch: true,
      key: 'mode',
      render: (text: string) =>
        text === 'full' ? <Tag color="red">全量</Tag> : <Tag color="green">增量</Tag>
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      hideInSearch: true,
      key: 'updatedAt',
      render: (val: string) => new Date(val).toLocaleString()
    },
    {
      title: '信息',
      dataIndex: 'message',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'actions',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <>
          <Button size="small" onClick={() => syncSingle(record.collectionName, 'incremental')} loading={loading}>
            增量
          </Button>{' '}
          <Button size="small" danger onClick={() => syncSingle(record.collectionName, 'full')} loading={loading}>
            全量
          </Button>
        </>
      )
    }

  ];

  return (
    <div>

      <PageContainer>
        <ProTable<API.ItemData, API.PageParams>
          rowKey="_id"
          toolBarRender={() => [
            access.canAdmin && (
              <Button type="primary" onClick={() => sync('full')} loading={loading}>
                全量同步数据
              </Button>
            ),
            access.canAdmin && (

              <Button onClick={() => sync('incremental')} loading={loading}>
                增量同步数据
              </Button>
            ),
            access.canAdmin && (

              <Button onClick={beiyongBtn} loading={loading}>
                备用按钮
              </Button>
            ),
          ]}
          actionRef={actionRef}
          request={async (params, sort, filter) => queryList('/blogs/syncMetaList', params, sort, filter)}
          columns={columns}
          search={false}
        />

      </PageContainer>
    </div>

  );
};

export default BlogCrawler;
