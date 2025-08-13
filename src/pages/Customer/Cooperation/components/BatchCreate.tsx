import { ModalForm, ProFormTextArea, ProColumns } from '@ant-design/pro-components';
import { Alert, Button, message, Table, Tag, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { addItem } from '@/services/ant-design-pro/api';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

type CooperationRecord = {
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

const columns: ProColumns<CooperationRecord>[] = [
  { title: '状态', dataIndex: 'status' },
  { title: '联系方式', dataIndex: 'contact' },
  {
    title: '告知ChatGPT5',
    dataIndex: 'informChatGPT5',
    render: (_, record) => (record.informChatGPT5 ? '是' : '否'),
  },
  {
    title: 'ChatGPT回复',
    dataIndex: 'chatGPTReplyTags',
    render: (_, record) =>
      record.chatGPTReplyTags?.map((tag) => <Tag key={tag}>{tag}</Tag>),
  },
  { title: '总稿费', dataIndex: 'totalFee' },
  { title: '已结稿费', dataIndex: 'settledFee' },
  { title: '未结稿费', dataIndex: 'unsettledFee' },
  { title: '首单佣金', dataIndex: 'firstCommission' },
  { title: '后续佣金', dataIndex: 'followUpCommission' },
  { title: '发布日期', dataIndex: 'publishDate' },
  { title: '网址', dataIndex: 'website' },
  { title: '负责人', dataIndex: 'owner' },
  { title: '备注', dataIndex: 'remark' },
];

const parseExcelDate = (val: any): string => {
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val);
    return date
      ? `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
      : '';
  }
  const d = dayjs(val, ['YYYY年M月D日', 'YYYY-M-D', 'YYYY/M/D', 'YYYY.M.D'], true);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

const BatchImportCooperation = ({
                                  open,
                                  onOpenChange,
                                  onSuccess,
                                }: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSuccess: () => void;
}) => {
  const [parsedData, setParsedData] = useState<CooperationRecord[]>([]);

  const parseRows = (rows: any[][]) => {
    const result: CooperationRecord[] = [];
    for (const cells of rows) {
      if (cells.length < 5) continue;
      const [
        status,
        contact,
        informChatGPT5,
        chatGPTReplyTags,
        totalFee,
        settledFee,
        unsettledFee,
        firstCommission,
        followUpCommission,
        publishDate,
        website,
        owner,
        remark,
      ] = cells;
      result.push({
        status,
        contact,
        informChatGPT5: informChatGPT5 === '是',
        chatGPTReplyTags: chatGPTReplyTags
          ? chatGPTReplyTags.split('|').map((t: string) => t.trim())
          : [],
        totalFee: Number(totalFee) || 0,
        settledFee: Number(settledFee) || 0,
        unsettledFee: Number(unsettledFee) || 0,
        firstCommission: Number(firstCommission) || 0,
        followUpCommission: Number(followUpCommission) || 0,
        publishDate: parseExcelDate(publishDate),
        website,
        owner,
        remark,
      });
    }
    setParsedData(result);
  };

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

  return (
    <ModalForm
      title="批量导入合作登记"
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
        try {
          await addItem('/cooperationRecords/import', { records: parsedData });
          message.success(`成功导入 ${parsedData.length} 条数据`);
          onSuccess();
          return true;
        } catch (err: any) {
          message.error(err?.response?.data?.message || '导入失败');
          return false;
        }
      }}
    >
      <ProFormTextArea
        label="粘贴 Excel 数据"
        placeholder="状态, 联系方式, 告知ChatGPT5(是/否), ChatGPT回复(用|分隔), 总稿费, 已结稿费, 未结稿费, 首单佣金, 后续佣金, 发布日期, 网址, 负责人, 备注"
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

      {parsedData.length > 0 && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ margin: '12px 0' }}
            message={`已解析 ${parsedData.length} 条记录`}
          />
          <Table
            size="small"
            dataSource={parsedData}
            columns={columns as any}
            rowKey={(r, i) => r.contact + i}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </>
      )}
    </ModalForm>
  );
};

export default BatchImportCooperation;
