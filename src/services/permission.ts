import { request } from '@umijs/max';

export const getPermissionGroups = async () => {
    const res = await request('/permissions');
    return res.data || {};
};
