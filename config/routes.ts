export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },

  {
    name: '客户管理',
    icon: 'table',
    access: 'system',
    path: '/customer',
    routes: [
      {
        name: '数据看板',
        icon: 'link',
        access: 'userManage',
        path: '/customer/DataDashboard',
        component: './Customer/DataDashboard',
      },
      {
        name: '客户总表',
        icon: 'link',
        access: 'userManage',
        path: '/customer/AllCustomer',
        component: './Customer/AllCustomer',
      },
      {
        name: '我的客户',
        icon: 'link',
        access: 'userManage',
        path: '/customer/MyCustomer',
        component: './Customer/MyCustomer',
      },
      {
        name: '待合作',
        icon: 'TagOutlined',
        access: 'userManage',
        path: '/customer/pending',
        component: './Customer/PendingCustomer',
      },
      {
        name: '已合作',
        icon: 'TagOutlined',
        access: 'userManage',
        path: '/customer/active',
        component: './Customer/ActiveCustomer',
      },
      // {
      //   path: '/users/blog-crawler',
      //   name: '数据同步',
      //   component: './BlogCrawler',
      // },
    ],
  },

  {
    name: '系统管理',
    icon: 'table',
    access: 'system',
    path: '/users',
    routes: [
      {
        name: '用户管理',
        icon: 'link',
        access: 'userManage',
        path: '/users/userManage',
        component: './Users',
      },
      {
        name: '角色管理',
        icon: 'TagOutlined',
        access: 'roleManage',
        path: '/users/roleManage',
        component: './Roles',
      },
      {
        path: '/users/blog-crawler',
        name: '数据同步',
        component: './BlogCrawler',
      },
    ],
  },
  {
    path: '/',
    redirect: '/customer/MyCustomer',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
