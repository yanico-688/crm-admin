// utils/addExcelFilters.ts
import type { ProColumns } from '@ant-design/pro-components';
import React from 'react';
import { request } from '@umijs/max';
import { Button, Checkbox, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
export function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const wrapped = (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  (wrapped as any).cancel = () => { if (timer) clearTimeout(timer); };
  return wrapped as F & { cancel: () => void };
}


export function addExcelFilters<T extends Record<string, any>>(
  columns: ProColumns<T>[],
  uniqueValues: Record<string, string[]>,
): ProColumns<T>[] {
  return columns.map((col) => {
    if (!col.dataIndex || typeof col.dataIndex !== 'string') return col;
    const values = uniqueValues[col.dataIndex];
    if (!values || values.length === 0) return col;

    return {
      ...col,
      filters: values.map(v => ({ text: v, value: v })), // 先给 50 条
      filterSearch: true, // 内置搜索（此时仅 50 条）
    };
  });
}



/**
 * 远程筛选面板：输入关键字 -> 调后端搜索唯一值；点“确定”走表格 request
 * @param field 后端要查的字段名
 * @param api   后端接口路径（默认示例为潜在顾客）
 * @param fetchSize 每次返回多少条候选
 */
export const remoteFilterDropdown =
  (field: string, api = '/myCustomers/unique-filter-values', fetchSize = 50) =>
    ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
      const [opts, setOpts] = React.useState<string[]>([]);
      const [loading, setLoading] = React.useState(false);

      const fetchOpts = React.useMemo(
        () =>
          debounce(async (kw: string) => {
            setLoading(true);
            const res = await request(api, {
              params: { field, keyword: kw ?? '', limit: fetchSize },
            });
            setOpts(res?.data || []);
            setLoading(false);
          }, 250),
        [field, api, fetchSize],
      );

      // 面板初次打开拉一波
      React.useEffect(() => {
        fetchOpts('');
        return () => fetchOpts.cancel();
      }, [fetchOpts]);

      return (
        <div style={{ padding: 8, width: 260 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索… "
            onChange={(e) => fetchOpts(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            <Checkbox.Group
              value={selectedKeys as string[]}
              onChange={(vals) => setSelectedKeys(vals)}
            >
              {opts.map((v) => (
                <div key={v} style={{ lineHeight: '28px' }}>
                  <Checkbox value={v} disabled={loading}>
                    {v}
                  </Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </div>
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" size="small" onClick={() => confirm()}>
              确定
            </Button>
            <Button
              size="small"
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
            >
              重置
            </Button>
          </Space>
        </div>
      );
    };
