// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    data?: any;
    name?: string;
    avatar?: string;
    role: {
      _id: string;
      name: string;
      label: string;
    };
    _id?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
    inactiveCount?: number;
  };
  type IPriceList = {
    months: number;
    price: number;
    originalPrice: number;
    isOnline: boolean;
    isCarSeat: boolean;
    isSoldOut: boolean;
    isExclusive: boolean;
    exclusivePrice: number;
    exclusiveOriginalPrice: number;
    seatCount: number;
    seatName?: string;
    renewalType: string; // 续费类型
  };

  type ItemData = {
    [x: string]: never[];
    paymentTime: any;
    postpone: number;
    offlineFile: string;
    isOffline: boolean;
    summary: any;
    validCommission: any;
    isDuplicate: boolean;
    frozenCommission: any;
    refundInfo: any;
    signedBy: any;
    familyEmail: any;
    emailSendInfos: any[];
    originFrom: string;
    isExpired: any;
    region?: any;
    status?: string;
    image?: string;
    commissions?: any;
    amount?: any;
    distributor?: any;
    order?: any;
    platform?: {
      _id: string;
      deliveryMethod: string;
      priceList?: [IPriceList];
    };
    renewalType?: string;
    expirationTime?: data;
    customer?: any;
    listId?: string;
    data?: any;
    orders?: any;
    payment?: any;
    refundHist?: any;
    socialMedia?: string[];
    contactMethods?: string;
    paymentMethods?: string[];
    website?: string;
    contactDetails?: string[];
    type?: any;
    signedAt?: string;
    totalRefundAmount?: number;
    accountStatus?: string;
    descriptions?: string;
    cardSecretExpirationTime?: string;
    orderEndTime?: string;
    orderNumber?: string;
    articleNumber?: string;
    refundHistId?: string;
    code?: string;
    content?: string;
    salesRecords?: any;
    links?: any;
    message?: any;
    cardSecret?: string;
    usageStatus?: string;
    months?: string;
    isOnline?: boolean;
    isCarSeat?: boolean;
    isSoldOut?: boolean;
    isActive?: boolean;
    isFirstOrder?: boolean;
    allowFreeShipping?: boolean;
    disableTieredPricing?: boolean;
    individualUseOnly?: boolean;
    excludeSaleItems?: boolean;
    uploadedFile?: string;
    deliveryMethod?: string;
    platform?: string;
    file?: string;
    user?: any;
    resourceUrl?: any;
    category?: any;
    imageUrl?: string;
    title?: string;
    email?: string;
    _id?: string;
    types?: string;
    userinfo?: any;
    account?: any;
    id?: number;
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    seatCount?: number;
    updatedAt?: string;
    createdAt?: string;
    validUntil?: string;
    progress?: number;
    transaction_id?: string;
    isAgent?: boolean;
    invitedBy?: { name: string; email: string };
    revenueData?: any[]; // 添加 revenueData 字段
    commission?: number;
  };

  type ResData = {
    /** 列表的内容总数 */
    code?: number;
    data?: any;
    msg?: string;
  };

  type DataList = {
    filePath: any;
    data?: ListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type ListItem = {
    id?: number;
    _id?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  type LoginResult = {
    refreshToken?: string;
    success?: boolean;
    token?: string;
  };

  type RefreshResult = {
    refreshToken: string;
    success: boolean;
    token: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
    accountStatus?: string;
  };

  type RuleList = {
    data?: ItemData[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
  };

  type refreshParams = {
    refreshToken: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
