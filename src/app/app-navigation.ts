export const navigation = [
  // {
  //   text: 'Home',
  //   path: '/home',
  //   icon: 'home'
  // },
  {
    text: 'Service Orders',
    path: '/pages/service-orders',
    icon: 'paste'
  },
  {
    text: 'Technician Scheduling',
    icon: 'group',
    items: [
      {
        text: 'Calendar',
        path: '/pages/schedule',
        icon: 'event'
      },
      {
        text: 'Spreadsheet',
        path: '/pages/spreadsheet',
        icon: 'detailslayout'
      },
    ]
  }
];
