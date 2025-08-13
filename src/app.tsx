import React from 'react';
import { AvatarDropdown, AvatarName, SelectLang } from '@/components';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { Link } from '@@/exports';
import TiXianRed from '@/components/socketNotification/TiXianRed';
import ShiYongRed from '@/components/socketNotification/ShiYongRed';
import LianMengRed from '@/components/socketNotification/LianMengRed';
import YunYingRed from '@/components/socketNotification/YunYingRed';

const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const response = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return {
        ...response.data,
        inactiveCount: response.data.inactiveCount || 0,
        unprocessedTodoCount: response.data.unprocessedTodoCount || 0,
      };
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const {location} = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

export const layout: ({initialState}: { initialState: any }) => any = ({initialState}) => {
  return {
    // ✅ 3. 父菜单项（带子菜单）使用红点
    subMenuItemRender: (item, dom) => {
      if (item.name === '运营推广') {
        return (
          <YunYingRed dom={dom}></YunYingRed>
        );
      }
      return dom;
    },


    menuItemRender: (item, dom) => {
      if (item.name === '提现记录') {
        return (
          <Link to={item.path.replace('/*', '')} target={item.target}>
            <TiXianRed dom={dom}></TiXianRed>
          </Link>

        );
      }
      if (item.name === '申请试用') {
        return (
          <Link to={item.path.replace('/*', '')} target={item.target}>
            <ShiYongRed dom={dom}></ShiYongRed>
          </Link>

        );
      }
      if (item.name === '联盟计划') {
        return (
          <Link to={item.path.replace('/*', '')} target={item.target}>
            <LianMengRed dom={dom}></LianMengRed>
          </Link>

        );
      }
      return (
        <Link to={item.path.replace('/*', '')} target={item.target}>
          {dom}
        </Link>
      );
    },
    actionsRender: () => [
      // <NotificationBadge key="NotificationBadge"/>,
      // <InactiveNotificationBadge key="InactiveNotificationBadge"/>,
      // <TodoNotificationBadge key="TodoNotificationBadge"/>,
      <SelectLang key="SelectLang"/>,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName/>,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    onPageChange: () => {
      const {location} = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    ...initialState?.settings,
  };
};
/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  baseURL: `${process.env.UMI_APP_API_URL}api`,
  ...errorConfig,
};
