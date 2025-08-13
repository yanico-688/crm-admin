import {useEffect, useState} from 'react';
import {queryList} from '@/services/ant-design-pro/api';

type QueryParams = Record<string, any>;

const useQueryParamsList = (url: string, options?: { params?: QueryParams }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = async (extraParams: QueryParams = {}) => {
    setLoading(true);
    const response = (await queryList(url, {
      pageSize: 10000,
      ...(options?.params || {}),
      ...extraParams,
    })) as any;
    if (response.success) {
      setItems(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    query().catch(console.error);
  }, [url, JSON.stringify(options?.params)]); // 加上依赖，参数变自动更新

  return {items, setItems, query, loading};
};


export default useQueryParamsList;
