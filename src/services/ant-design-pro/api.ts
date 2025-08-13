// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getList(url: string) {
  return request(url, { method: 'GET' });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/auth/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>(`/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function refreshToken(body: API.refreshParams, options?: { [key: string]: any }) {
  return request<API.RefreshResult>(`/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryDataList(
  url: string,
  params: { [key: string]: any },
  sort?: { [key: string]: any },
  filter?: { [key: string]: any },
) {
  const res = await request<API.ResData>(url, {
    method: 'POST',
    params: {
      ...params,
      page: params.current,
      limit: params.pageSize,
      sorter: sort,
      ...filter,
    },
  });

  let data;

  if (Array.isArray(res.data)) {
    data = res.data;
  } else {
    data = res.data.data;
  }

  return {
    success: res.code === 1,
    data,
    total: res.data.total,
  };
}
export async function queryItem<T = any>(
  url: string,
  params?: { [key: string]: any }
) {
  return request<T>(url, {
    method: 'GET',
    params,
  });
}

export async function queryList(
  url: string,
  params?: { [key: string]: any },
  sort?: { [key: string]: any },
  filter?: { [key: string]: any },
) {
  return request<API.DataList>(url, {
    method: 'GET',
    params: {
      ...params,
      page: params!.current,
      limit: params!.pageSize,
      sorter: sort,
      ...filter,
    },
  });
}

export async function addItem(url: string, options?: { [key: string]: any }) {
  return request<API.ItemData>(url, {
    method: 'POST',
    data: {
      ...(options || {}),
    },
  });
}
export async function uploadFormData(url: string, formData: FormData) {
  return request<API.DataList>(url, {
    method: 'POST',
    data: formData, // 注意：UMI 的 request 会自动识别 FormData 为 multipart
    requestType: 'form', // 强制 multipart/form-data
  });
}

export async function updateItem(url: string, options?: { [key: string]: any }) {
  return request<API.ListItem>(url, {
    method: 'PUT',
    data: {
      ...(options || {}),
    },
  });
}

export async function handelItem(url: string, options?: { [key: string]: any }) {
  return request<API.ListItem>(url, {
    method: 'PATCH',
    data: {
      ...(options || {}),
    },
  });
}

export async function removeItem(url: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>(url, {
    method: 'DELETE',
    data: {
      ...(options || {}),
    },
  });
}
