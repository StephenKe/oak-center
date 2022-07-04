export default [
  {
    layout: false,
    path: '/',
    component: './user/Chat',
  },
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/Login',
      },
      {
        name: 'chat',
        path: '/user/chat',
        component: './user/Chat',
      },
      {
        component: './404',
      },
    ],
  },
  // {
  //   path: '/welcome',
  //   name: 'welcome',
  //   icon: 'smile',
  //   component: './Welcome',
  // },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   component: './Admin',
  //   routes: [
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       icon: 'smile',
  //       component: './Welcome',
  //     },
  //     {
  //       component: './404',
  //     },
  //   ],
  // },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './TableList',
  // },
  {
    name: 'list.pay-list',
    icon: 'PayCircleOutlined',
    path: '/dashboard',
    component: './PayList',
  },
  // {
  //   path: '/',
  //   redirect: '/user/chat',
  //   // redirect: '/list',
  // },
  {
    name: 'list.notice',
    icon: 'ClockCircleOutlined',
    path: '/notice',
    component: './Notice',
  },
  {
    name: 'list.trade',
    icon: 'TrademarkCircleOutlined',
    path: '/trade',
    component: './Trade',
  },
  {
    component: './404',
  },
];
