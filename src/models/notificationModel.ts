import {useState, useCallback} from 'react';

export default function Page() {
  const [tiXianCount, setTiXianCount] = useState<number>(0);
  const [lianMengCount, setLianMengCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [applyTrialCount, setApplyTrialCount] = useState<number>(0);
  const [todoListcount, setTodoListCount] = useState<number>(0);
  const getRedCount = useCallback((data: {
      lianMeng: number,
      tiXian: number,
      todoList: number,
      applyTrial: number,
      inactiveOrders: number,
    }) => {
      setTiXianCount(data.tiXian);
      setLianMengCount(data.lianMeng);
      setOrderCount(data.inactiveOrders);
      setApplyTrialCount(data.applyTrial);
      setTodoListCount(data.todoList);
    },
    []);

  return {
    getRedCount,
    orderCount,
    applyTrialCount,
    todoListcount,
    tiXianCount,
    lianMengCount,
  };
}
