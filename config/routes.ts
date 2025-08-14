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
        name: '客户总表',
        icon: 'link',
        access: 'userManage',
        path: '/customer/PotentialCustomer',
        component: './Customer/PotentialCustomer',
      },
      {
        name: '合作登记',
        icon: 'TagOutlined',
        access: 'roleManage',
        path: '/customer/Cooperation',
        component: './Customer/Cooperation',
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
      // {
      //   path: '/users/blog-crawler',
      //   name: '数据同步',
      //   component: './BlogCrawler',
      // },
    ],
  },
  {
    path: '/',
    redirect: '/customer/PotentialCustomer',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
