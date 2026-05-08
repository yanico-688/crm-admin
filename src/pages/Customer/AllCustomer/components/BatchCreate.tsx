import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { Alert, Button, message, Table, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { addItem } from '@/services/ant-design-pro/api';
import * as XLSX from 'xlsx';

const columns = [
  { title: '渠道', dataIndex: 'source', width: 100 },
  { title: '联系方式', dataIndex: 'contact', width: 200 },
  { title: '平台网址', dataIndex: 'platformUrl', width: 200 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '标签', dataIndex: 'tags', width: 100 },
  { title: '备注', dataIndex: 'remark', width: 120 },
  {
    title: '校验',
    dataIndex: 'validationStatus',
    width: 80,
    render: (text: string) => {
      if (!text || text === '待校验') {
        return <span style={{ color: '#faad14' }}>待校验</span>;
      }
      if (text.includes('重复')) {
        return <span style={{ color: '#ff4d4f' }}>⚠️ {text}</span>;
      }
      return <span style={{ color: '#52c41a' }}>✅ {text}</span>;
    },
  },
];

const BatchCreate = ({
                       open,
                       onOpenChange,
                       onSuccess,
                     }: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSuccess: () => void;
}) => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ✅ 一键校验重复账号
  const validateAccounts = async (data: any[]) => {
    try {
      const contacts = data.map((d) => d.contact);
      const res = await addItem('/allCustomers/check-duplicate', {contacts});
      const duplicates: string[] = res.duplicates || [];
      return data.map((item) => ({
        ...item,
        validationStatus: duplicates.includes(item.contact) ? '重复' : '正常',
      }));
    } catch {
      message.error('校验失败');
      return data;
    }
  };


  // ✅ 解析行数据
  const parseRows = async (rows: any[][]) => {
    const result: any[] = [];
    for (const cells of rows) {
      if (cells.length < 1) continue;
      const [source,contact,  platformUrl ,tags,remark] = cells;
      result.push({
        source,
        contact,
        platformUrl,
        status: '可领取',
        tags,
        remark
      });
    }
    setParsedData(result);
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, {type: 'array'});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any = XLSX.utils.sheet_to_json(sheet, {header: 1}).slice(1);
      await parseRows(rows);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <ModalForm
      title="批量导入账号"
      width={1200}
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setParsedData([]);
      }}
      modalProps={{destroyOnClose: true}}
      onFinish={async () => {
        if (parsedData.length === 0) {
          message.warning('无数据可提交');
          return false;
        }

        // 阻止重复或未校验账号提交
        if (parsedData.some((d) => d.validationStatus === '重复')) {
          message.error('存在重复账号，请处理后再试');
          return false;
        }
        if (parsedData.some((d) => !d.validationStatus || d.validationStatus === '待校验')) {
          message.error('存在未校验账号，请先点击“一键校验”');
          return false;
        }

        const valid = parsedData.filter((d) => d.validationStatus === '正常');
        const BATCH_SIZE = 300;
        const batches = [];
        for (let i = 0; i < valid.length; i += BATCH_SIZE) {
          batches.push(valid.slice(i, i + BATCH_SIZE));
        }

        try {
          for (let i = 0; i < batches.length; i++) {
            await addItem('/allCustomers/import', {customers: batches[i]});
            message.success(`第 ${i + 1} 批导入成功`);
          }
          message.success(`全部导入成功，共 ${valid.length} 条`);
          onSuccess?.();
          return true;
        } catch (err: any) {
          message.error(err?.response?.data?.message || '导入失败');
          return false;
        }
      }}
    >
      <ProFormTextArea
        label="粘贴 Excel 多列数据"
        placeholder="格式：渠道，联系方式， 平台网址，标签 ，备注"
        fieldProps={{
          rows: 8,
          onChange: async (e) => {
            const lines = e.target.value
              .trim()
              .split('\n')
              .map((l) => l.split(/\t|,|，/).map((c) => c.trim()));
            await parseRows(lines);
          },
        }}
        rules={[{required: true, message: '请输入或上传账号数据'}]}
      />

      <Upload accept=".xlsx,.csv" showUploadList={false} beforeUpload={onUpload}>
        <Button icon={<UploadOutlined/>}>上传 Excel 文件</Button>
      </Upload>

      <Button
        type="primary"
        style={{marginLeft: 12}}
        onClick={async () => {
          if (parsedData.length === 0) {
            message.warning('无数据可校验');
            return;
          }
          const updated = await validateAccounts(parsedData);
          setParsedData(updated);
        }}
      >
        一键校验数据
      </Button>

      {parsedData.length > 0 && (
        <>
          <Alert
            type="info"
            showIcon
            style={{margin: '12px 0'}}
            message={`共解析 ${parsedData.length} 条，其中待校验 ${parsedData.filter(d => !d.validationStatus).length} 条，重复 ${parsedData.filter(d => d.validationStatus === '重复').length} 条，正常 ${parsedData.filter(d => d.validationStatus === '正常').length} 条`}
          />
          <Table
            size="small"
            dataSource={parsedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            columns={columns}
            rowKey={(r, i) => r.account + i}
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
            scroll={{x: 'max-content'}}
          />
        </>
      )}
    </ModalForm>
  );
};

export default BatchCreate;
