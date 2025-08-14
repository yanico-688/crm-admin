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
  settledFee: number;
  unsettledFee: number;
  firstCommission: number;
  followUpCommission: number;
  publishDate: string;
  publishDate2: string;
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
  { title: '已结稿费', dataIndex: 'settledFee' },
  { title: '未结稿费', dataIndex: 'unsettledFee' },
  { title: '首单佣金', dataIndex: 'firstCommission' },
  { title: '后续佣金', dataIndex: 'followUpCommission' },
  { title: '发布日期', dataIndex: 'publishDate' },
  { title: '发布日期2', dataIndex: 'publishDate2' },
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const parseRows = (rows: any[][]) => {
    const result: CooperationRecord[] = [];
    for (const cells of rows) {
      if (cells.length < 5) continue;
      let [
        status,
        contact,
        informChatGPT5,
        chatGPTReplyTags,
        settledFee,
        unsettledFee,
        firstCommission,
        followUpCommission,
        publishDate,
        website,
        owner,
        remark,
      ] = cells;

      // 1. 联系方式：去掉括号内容，拆分成数组
      let contactList: string[] = [];
      if (contact) {
        contactList = contact
          .replace(/\(.*?\)|（.*?）/g, '') // 去括号及内容
          .trim()
          .split(/[\s,，;；]+/) // 按空格/逗号/分号切分
          .filter(Boolean);
      }

      // 2. 佣金处理
      const formatCommission = (val: any) => {
        let num = Number(val) || 0;
        if (num > 0 && num < 1) {
          num *= 100;
        }
        return num;
      };

      // 3. 发布日期拆分
      let publishDate1 = '';
      let publishDate2 = '';
      if (publishDate) {
        const parts = String(publishDate)
          .split(/→|->|—|-/)
          .map(s => s.trim())
          .filter(Boolean);
        if (parts.length > 0) publishDate1 = parseExcelDate(parts[0]);
        if (parts.length > 1) publishDate2 = parseExcelDate(parts[1]);
      }

      result.push({
        status,
        contact: contactList,
        informChatGPT5: informChatGPT5 === 'Yes',
        chatGPTReplyTags: chatGPTReplyTags
          ? chatGPTReplyTags.split(/[|，, ]+/).map((t: string) => t.trim())
          : [],
        settledFee: Number(settledFee) || 0,
        unsettledFee: Number(unsettledFee) || 0,
        firstCommission: formatCommission(firstCommission),
        followUpCommission: formatCommission(followUpCommission),
        publishDate: publishDate1,
        publishDate2,
        website,
        owner,
        remark,
      } as any);
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
          const batchSize = 200; // 每批导入数量
          let successCount = 0;

          for (let i = 0; i < parsedData.length; i += batchSize) {
            const batch = parsedData.slice(i, i + batchSize);
            await addItem('/cooperationRecords/import', { records: batch });
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
        label="粘贴 Excel 数据"
        placeholder="状态, 联系方式, 告知ChatGPT5(是/否), ChatGPT回复(用|分隔), 已结稿费, 未结稿费, 首单佣金, 后续佣金, 发布日期, 网址, 负责人, 备注"
        fieldProps={{
          rows: 6,
          onChange: (e) => {
            const lines = e.target.value
              .trim()
              .split('\n')
              .map((l) => l.split(/\t/).map((c) => c.trim()));
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

export default BatchImportCooperation;
