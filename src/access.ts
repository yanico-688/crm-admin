export const ROLES = {
  SuperAdmin: 'SUPER_ADMIN',
  Admin: 'ADMIN',
} as const;

interface CurrentUser {
  role?: {
    name?: string;
    permissions?: string[];
  };
}

// 子权限 → 父权限映射表（扁平命名，统一格式）
const parentMap: Record<string, string> = {
  dataVision: 'customer',
  allCus: 'customer',
  pendingCus: 'customer',
  myCus: 'customer',
  activeCus: 'customer',
  userManage: 'system',
  roleManage: 'system',
  crawlerBlog: 'system',
};

// 将权限数组转换为布尔对象，并自动添加对应父权限
export const getPermissionsObject = (permissionsArray: string[]) => {
  const result: Record<string, boolean> = {};

  permissionsArray.forEach((code) => {
    result[code] = true;

    const parent = parentMap[code];
    if (parent) {
      result[parent] = true;
    }
  });

  return result;
};

export default function access(initialState: { currentUser?: CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  const roleName = currentUser?.role?.name;

  const isAdmin = roleName === ROLES.SuperAdmin || roleName === ROLES.Admin;

  const rawPermissions = isAdmin
    ? [
        // 平台默认权限（全权限）
        'crawlerBlog',
        'roleManage',
        'userManage',
        'activeCus',
        'pendingCus',
        'myCus',
        'allCus',
        'dataVision',
        'customer',
        'system',
        // 管理特殊权限
        'canSuperAdmin',
        'canAdmin',
      ]
    : currentUser?.role?.permissions || [];

  return getPermissionsObject(rawPermissions);
}
