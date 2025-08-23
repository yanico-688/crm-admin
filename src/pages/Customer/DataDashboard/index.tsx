import { getList, queryItem } from '@/services/ant-design-pro/api';
import * as echarts from 'echarts';
import React, { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import { Segmented } from 'antd'; // 🔑 用 Segmented 实现 Tabs 效果
// 固定颜色映射
const colors: Record<string, string> = {
  未回复: '#d9d9d9',
  已回复: '#722ed1',
  谈判: '#fa8c16',
  已合作: '#95de64',
  待合作: '#40a9ff',
};

const API_PATH = '/myCustomers';

const DataDashboard: React.FC = () => {
  const pieRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>(''); // 空 = 总表

  // 请求负责人列表
  useEffect(() => {
    getList(`${API_PATH}/owners`).then((res) => {
      if (res.success) setOwners(res.data);
    });
  }, []);

  // 请求后端数据
  useEffect(() => {
    queryItem(`${API_PATH}/customerStatus`, selectedOwner ? { owner: selectedOwner } : {}).then(
      (res) => {
        if (res.success) {
          const arr = Object.entries(res.data).map(([name, value]) => ({
            name,
            value: value as number,
          }));
          setData(arr);
        }
      },
    );
  }, [selectedOwner]);

  // 渲染饼图
  useEffect(() => {
    if (!pieRef.current || data.length === 0) return;
    const chart = echarts.init(pieRef.current);

    const total = data.reduce((a, b) => a + b.value, 0);

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, orient: 'horizontal' },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{c} ({d}%)' },
          data: data.map((d) => ({
            ...d,
            itemStyle: { color: colors[d.name] },
          })),
        },
      ],
      graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: total.toString(),
          fontSize: 28,
          fontWeight: 'bold',
        },
      },
    });

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [data]);

  // 渲染柱状图
  useEffect(() => {
    if (!barRef.current || data.length === 0) return;
    const chart = echarts.init(barRef.current);

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 40, left: 40, right: 40, bottom: 60 },
      xAxis: { type: 'category', data: data.map((d) => d.name) },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          barWidth: '50%',
          data: data.map((d) => ({
            value: d.value,
            itemStyle: { color: colors[d.name], borderRadius: [6, 6, 0, 0] },
          })),
        },
      ],
    });

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      {/* 切换按钮（客户总表 / 负责人） */}
      <div style={{ marginBottom: 20 }}>
        <Segmented
          value={selectedOwner || '客户总表'}
          onChange={(val) => setSelectedOwner(val === '客户总表' ? '' : (val as string))}
          options={[
            '客户总表',
            ...owners.map((o) => `${o}`), // 每个负责人
          ]}
        />
      </div>

      {/* 图表区域 */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* 饼图卡片 */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: 16 }}>客户状态分布（饼图）</h3>
          <div ref={pieRef} style={{ width: '100%', height: 400 }} />
        </div>

        {/* 柱状图卡片 */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: 16 }}>客户状态分布（柱状图）</h3>
          <div ref={barRef} style={{ width: '100%', height: 400 }} />
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;
