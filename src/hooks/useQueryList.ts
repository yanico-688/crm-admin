import { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';

const useQueryList = (url: string) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    setLoading(true);
    const response = (await queryList(url, { pageSize: 10000 })) as any;
    if (response.success) {
      setItems(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    query().catch(console.error);
  }, []);

  return { items, setItems, query, loading };
};

export default useQueryList;
