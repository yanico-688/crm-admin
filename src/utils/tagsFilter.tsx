// utils/addExcelFilters.ts
import type { ProColumns } from '@ant-design/pro-components';

/**
 * 给 ProTable 所有列自动添加 Excel 式筛选功能（支持字符串、数字、数组）
 * @param columns 原始 columns
 * @param list 表格数据（后台返回的 data 数组）
 */
export function addExcelFilters<T extends Record<string, any>>(
  columns: ProColumns<T>[],
  list: T[]
): ProColumns<T>[] {
  return columns.map(col => {
    if (!col.dataIndex || typeof col.dataIndex !== 'string') return col;

    const valuesSet = new Set<string>();
    list.forEach(item => {
      const val = item[col.dataIndex as keyof T];
      if (Array.isArray(val)) {
        val.forEach((v:any) => v !== null && valuesSet.add(String(v)));
      } else if (val !== null) {
        valuesSet.add(String(val));
      }
    });

    const filtersArray = Array.from(valuesSet).map(v => ({ text: v, value: v }));
    if (filtersArray.length === 0) return col;

    return {
      ...col,
      filters: filtersArray,
      filterSearch: true,
      onFilter: (value, record) => {
        const cell = record[col.dataIndex as keyof T];
        if (Array.isArray(cell)) {
          return cell.map((v:any) => String(v)).includes(String(value));
        }
        return String(cell) === String(value);
      },
    };
  });
}

