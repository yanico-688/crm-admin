export const ROLES = {
  SuperAdmin: 'SUPER_ADMIN',
  Admin: 'ADMIN',
} as const;

// 子权限 → 父权限映射表（扁平命名，统一格式）
const parentMap: Record<string, string> = {
  dashboardOrder: 'dashboard',
  dashboardCommission: 'dashboard',

  productRegion: 'product',
  productPlatform: 'product',
  productCard: 'product',
  productDesc: 'product',

  customerList: 'customer',
  customerOnline: 'customer',
  customerVisitLog: 'customerVisit',
  customerDailyVisit: 'customerVisit',

  orderList: 'customer',
  carDetail: 'customer',
  seatDetail: 'customer',

  ticketList: 'support',
  refundHist: 'support',
  todoList: 'support',
  postponeRecord: 'support',
  migrationRecord: 'support',

  paymentRecord: 'payment',

  affiliate: 'marketing',
  applyTrial: 'marketing',
  couponList: 'marketing',
  couponBatch: 'marketing',
  agentList: 'marketing',
  commissionDetail: 'marketing',
  commissionLogs: 'marketing',
  withdrawRecord: 'marketing',

  userManage: 'system',
  roleManage: 'system',
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

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  const roleName = currentUser?.role?.name;

  const isAdmin = roleName === ROLES.SuperAdmin || roleName === ROLES.Admin;

  const rawPermissions = isAdmin
    ? [
      // 平台默认权限（全权限）
      'dashboardOrder',
      'dashboardCommission',
      'productRegion',
      'productPlatform',
      'productCard',
      'productDesc',
      'customerList',
      'customerOnline',
      'customerVisitLog',
      'customerDailyVisit',
      'orderList',
      'carDetail',
      'seatDetail',
      'ticketList',
      'refundHist',
      'todoList',
      'postponeRecord',
      'migrationRecord',
      'paymentRecord',
      'affiliate',
      'applyTrial',
      'couponList',
      'couponBatch',
      'agentList',
      'commissionDetail',
      'commissionLogs',
      'withdrawRecord',
      'userManage',
      'roleManage',

      // 管理特殊权限
      'canSuperAdmin',
      'canAdmin',
    ]
    : currentUser?.role?.permissions || [];

  return getPermissionsObject(rawPermissions);
}
