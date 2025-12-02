import CopyToClipboard from '@/components/CopyToClipboard';
import CrawlLogViewer from '@/pages/BlogCrawler/CrawlLogViewer';
import { MyCustomer } from '@/pages/Customer/MyCustomer';
import { addItem, queryList } from '@/services/ant-design-pro/api';
import {
  type ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, DatePicker, Input, InputNumber, message, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const { RangePicker } = DatePicker;
type BlogData = {
  _id: string;
  title: string;
  url: string;
  author?: string;
  createdAt?: string;
};

const BlogCrawler: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState<string>(''); // 关键字
  const [page, setPage] = useState<number>(1); // 爬虫页码
  const [stopping, setStopping] = useState(false); // 停止中状态
  const [startPage, setStartPage] = useState<number>(1); // 起始页
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedRowsState, setSelectedRows] = useState<MyCustomer[]>([]);
  const actionRef = useRef<ActionType>();
  const handleCrawl = async () => {
    if (!keyword.trim()) {
      message.warning('请输入关键字');
      return;
    }
    if (page <= 0) {
      message.warning('请输入正确的页码');
      return;
    }
    if (!dateRange) {
      message.warning('请选择时间范围');
      return;
    }
    const [start, end] = dateRange;
    setLoading(true);
    try {
      const res: any = await addItem('/allCustomers/crawlBlogs', {
        keyword,
        page,
        startPage,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      });
      if (res.success) {
        message.success(res.message);
        // 🔑 爬虫完成后刷新表格
        actionRef.current?.reload?.();
      }
    } catch (e: any) {
      message.error(e.message || '请求出错');
    } finally {
      setLoading(false);
    }
  };
  // 停止爬虫
  const handleStopCrawl = async () => {
    setStopping(true);
    try {
      const res = await addItem('/allCustomers/stopCrawl', {});
      if (res.success) {
        message.success('爬虫已停止');
        actionRef.current?.reload?.();
      } else {
        message.error(res.message || '停止失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求出错');
    } finally {
      setStopping(false);
    }
  };

  const columns: ProColumns<any>[] = [
    { title: '编号', dataIndex: 'no' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '平台网址',
      dataIndex: 'platformUrl',
      render: (_, record) => (
        <a href={record.platformUrl} target="_blank" rel="noopener noreferrer">
          {record.platformUrl} <CopyToClipboard text={record.platformUrl} />
        </a>
      ),
    },
    {
      title: '链接',
      dataIndex: 'link',
      render: (_, record) => (
        <a href={record.link} target="_blank" rel="noopener noreferrer">
          {record.link}
        </a>
      ),
    },
    { title: '关键词', dataIndex: 'keyword' },
    { title: '页码', dataIndex: 'page' },
    { title: '重复次数', dataIndex: 'repeatCount' },
    { title: '本次进程数', dataIndex: 'totalProcessed' },
    { title: '爬取时间', dataIndex: 'createdAt', valueType: 'dateTime' },
    { title: '备注', dataIndex: 'remark' },
  ];
  // 新增方法
  const handleAddToMaster = async () => {
    if (selectedRowsState.length === 0) {
      message.warning('请先选择数据');
      return;
    }
    try {
      // 只传 ids
      const ids = selectedRowsState.map((row) => row._id);
      const res = await addItem('/allCustomers/addToAll', { ids });
      if (res.success) {
        message.success(res.message || '已加入总表');
        setSelectedRows([]); // 清空选择
        actionRef.current?.reload?.(); // 刷新表格
      } else {
        message.error(res.message || '加入总表失败');
      }
    } catch (e: any) {
      message.error(e.message || '请求出错');
    }
  };
  return (
    <PageContainer>
      {/* 🔥 实时日志窗口 */}
      <h3 style={{ marginTop: 16 }}>实时爬虫日志</h3>
      <CrawlLogViewer />
      <ProTable<BlogData, API.PageParams>
        rowKey="_id"
        actionRef={actionRef}
        search={false}
        columns={columns}
        request={async (params) => {
          return (await queryList('/allCustomers/getBlogs', params)) as any; // 🔑 从后端取数据
        }}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows as any),
        }}
        toolBarRender={() => [
          <Space key="tools">
            关键字：
            <Input
              placeholder="请输入关键字"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
            />
            起始页数:
            <InputNumber
              min={1}
              value={startPage}
              onChange={(val) => setStartPage(val || 1)}
              style={{ width: 100 }}
            />
            结束页数:
            <InputNumber
              min={1}
              value={page}
              onChange={(val) => setPage(val || 1)}
              style={{ width: 100 }}
            />
            日期范围:
            <RangePicker
              value={dateRange}
              onChange={(val) => setDateRange(val as any)}
              disabledDate={(d) => d.isAfter(dayjs())} // 禁止选择未来日期
            />
            <Button type="primary" onClick={handleCrawl} loading={loading}>
              开始爬虫
            </Button>
            <Button danger onClick={handleStopCrawl} loading={stopping}>
              停止爬虫
            </Button>
          </Space>,
        ]}
      />

      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Space>
            <Button type="primary" onClick={handleAddToMaster}>
              加入总表
            </Button>
          </Space>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default BlogCrawler;
