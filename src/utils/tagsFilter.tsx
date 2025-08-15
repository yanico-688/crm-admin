// utils/addExcelFilters.ts
import type { ProColumns } from '@ant-design/pro-components';

function formatValue(value: any): string {
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  // 识别 ISO 日期格式并只取日期部分
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.split('T')[0]; // 只保留 YYYY-MM-DD
  }
  return String(value);
}


/**
 * 给 ProTable 所有列自动添加 Excel 式筛选功能（支持字符串、数字、数组）
 * @param columns 原始 columns
 * @param list 表格数据（后台返回的 data 数组）
 */
export function addExcelFilters<T extends Record<string, any>>(
  columns: ProColumns<T>[],
  list: T[],
): ProColumns<T>[] {
  return columns.map((col) => {
    if (!col.dataIndex || typeof col.dataIndex !== 'string') return col;

    const valuesSet = new Set<string>();
    list.forEach((item) => {
      const val = item[col.dataIndex as keyof T];
      if (Array.isArray(val)) {
        val.forEach((v: any) => {
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            valuesSet.add(formatValue(v));
          }
        });
      } else if (val !== undefined && val !== null && String(val).trim() !== '') {
        valuesSet.add(formatValue(val));
      }
    });

    const filtersArray = Array.from(valuesSet).map((v) => ({ text: v, value: v }));
    if (filtersArray.length === 0) return col;

    return {
      ...col,
      filters: filtersArray,
      filterSearch: true,
      onFilter: (value, record) => {
        const cell = record[col.dataIndex as keyof T];
        return formatValue(cell) === value;
      },
    };
  });
}
