import { ModalForm, ProFormTextArea, ProColumns } from '@ant-design/pro-components';
import { Alert, Button, Image, message, Table, Tag, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { addItem } from '@/services/ant-design-pro/api';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

interface PotentialCustomer {
  name: string;
  contact: string;
  platformUrl: string;
  emailSendTime: string;
  secondInvitation?: string;
  status: string;
  owner?: string;
  bloggerData?: string;
  remark?: string;
  validationStatus?: string; // 新增验证状态
}

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  已合作: { color: 'green', text: '已合作' },
  待合作: { color: 'blue', text: '待合作' },
  谈判: { color: 'orange', text: '谈判' },
  未回复: { color: 'pink', text: '未回复' },
  未联系: { color: 'default', text: '未联系' },
  确认放弃: { color: 'red', text: '确认放弃' },
  邮箱错的: { color: 'purple', text: '邮箱错的' },
  长期合作: { color: 'cyan', text: '长期合作' },
};

const columns: ProColumns<PotentialCustomer>[] = [
  { title: '姓名', dataIndex: 'name' },
  { title: '联系方式', dataIndex: 'contact', copyable: true },
  { title: '平台网址', dataIndex: 'platformUrl', ellipsis: true },
  { title: '发邮件时间', dataIndex: 'emailSendTime', valueType: 'dateTime' },
  { title: '二次邀约', dataIndex: 'secondInvitation', valueType: 'dateTime' },
  {
    title: '状态',
    dataIndex: 'status',
    render: (_, record) => {
      const status = STATUS_MAP[record.status] || { color: 'default', text: record.status };
      return <Tag color={status.color}>{status.text}</Tag>;
    },
  },
  { title: '负责人员', dataIndex: 'owner' },
  { title: '备注', dataIndex: 'remark', ellipsis: true },
  {
    title: '验证状态',
    dataIndex: 'validationStatus',
    render: (text) => {
      if (!text || text === '待校验') return <span style={{ color: '#faad14' }}>待校验</span>;
      if (text === '重复') return <span style={{ color: '#ff4d4f' }}>⚠️ 重复</span>;
      return <span style={{ color: '#52c41a' }}>✅ 正常</span>;
    },
  },
];

const BatchImportCustomers = ({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSuccess: () => void;
}) => {
  const [parsedData, setParsedData] = useState<PotentialCustomer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 模拟 Excel 日期解析
  const parseExcelDate = (val: any): string => {
    if (!val) return '';

    // 1. Excel 数字日期
    if (typeof val === 'number') {
      const date = XLSX.SSF.parse_date_code(val);
      if (date) {
        return (
          `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}` +
          (date.H || date.M || date.S
            ? ` ${String(date.H).padStart(2, '0')}:${String(date.M).padStart(2, '0')}`
            : '')
        );
      }
      return '';
    }

    // 2. 文本日期（支持多种格式）
    if (typeof val === 'string') {
      const formats = [
        'YYYY年M月D日',
        'YYYY年M月D日 HH:mm',
        'YYYY-M-D',
        'YYYY-M-D HH:mm',
        'YYYY/M/D',
        'YYYY/M/D HH:mm',
        'YYYY.M.D',
        'YYYY.M.D HH:mm',
      ];

      const d = dayjs(val.trim(), formats, true); // 严格模式匹配
      return d.isValid() ? d.format('YYYY-MM-DD') : '';
    }

    return '';
  };

  // 解析 Excel 行
  const parseRows = (rows: any[][]) => {
    const result: PotentialCustomer[] = [];
    for (const cells of rows) {
      if (cells.length < 4) continue;
      const [
        name,
        contact,
        platformUrl,
        emailSendTime,
        secondInvitation,
        status,
        owner,
        bloggerData,
        remark,
      ] = cells;
      result.push({
        name,
        contact,
        platformUrl,
        emailSendTime: parseExcelDate(emailSendTime),
        secondInvitation: parseExcelDate(secondInvitation),
        status,
        owner,
        bloggerData,
        remark,
        validationStatus: '待校验',
      });
    }
    setParsedData(result);
  };

  // 上传 Excel
  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1);
      parseRows(rows);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // 调后端验证重复
  const validateCustomers = async (data: PotentialCustomer[]) => {
    try {
      const batchSize = 100; // 每批校验数量
      let duplicates: string[] = [];

      // 分批循环
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const contacts = batch.map((d) => d.contact);
        const res = await addItem('/myCustomers/check-duplicate', { contacts });
        duplicates = duplicates.concat(res.duplicates || []);
      }

      // 更新状态
      const updated = data.map((item) => ({
        ...item,
        validationStatus: duplicates.includes(item.contact) ? '重复' : '正常',
      }));
      setParsedData(updated);
    } catch (e) {
      message.error('校验失败');
    }
  };

  return (
    <ModalForm
      title="批量导入潜在客户"
      width={1200}
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setParsedData([]);
      }}
      modalProps={{ destroyOnClose: true }}
      onFinish={async () => {
        if (!parsedData.length) {
          message.warning('无数据可提交');
          return false;
        }
        if (parsedData.some((d) => d.validationStatus === '重复')) {
          message.error('存在重复记录，请先处理');
          return false;
        }
        if (parsedData.some((d) => !d.validationStatus || d.validationStatus === '待校验')) {
          message.error('存在未校验数据，请先校验');
          return false;
        }
        try {
          const batchSize = 200; // 每批导入数量
          let successCount = 0;

          for (let i = 0; i < parsedData.length; i += batchSize) {
            const batch = parsedData.slice(i, i + batchSize);
            await addItem('/myCustomers/import', { customers: batch });
            successCount += batch.length;
          }
          message.success(`成功导入 ${successCount} 条数据`);
          onSuccess();
          return true;
        } catch (err: any) {
          message.error(err?.response?.data?.message || '导入失败');
          return false;
        }
      }}
    >
      <ProFormTextArea
        label="粘贴 Excel 多列数据"
        placeholder="按列顺序粘贴：姓名、联系方式、平台网址、发邮件时间、二次邀约、状态、负责人员、备注"
        fieldProps={{
          rows: 6,
          onChange: (e) => {
            const lines = e.target.value
              .trim()
              .split('\n')
              .map((l) => l.split(/\t|,|，/).map((c) => c.trim()));
            parseRows(lines);
          },
        }}
      />
      <Upload accept=".xlsx,.csv" showUploadList={false} beforeUpload={onUpload}>
        <Button icon={<UploadOutlined />}>上传 Excel 文件</Button>
      </Upload>
      <Button
        type="primary"
        style={{ marginLeft: 12 }}
        onClick={() => validateCustomers(parsedData)}
      >
        校验联系方式
      </Button>

      {parsedData.length > 0 && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ margin: '12px 0' }}
            message={`共 ${parsedData.length} 条，待校验 ${
              parsedData.filter((d) => d.validationStatus === '待校验').length
            } 条，重复 ${parsedData.filter((d) => d.validationStatus === '重复').length} 条，正常 ${
              parsedData.filter((d) => d.validationStatus === '正常').length
            } 条`}
          />
          <Table
            size="small"
            dataSource={parsedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            columns={columns as any}
            rowKey={(r, i) => r.contact + i}
            pagination={{
              current: currentPage,
              pageSize,
              total: parsedData.length,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 'max-content' }}
          />
        </>
      )}
    </ModalForm>
  );
};

export default BatchImportCustomers;
