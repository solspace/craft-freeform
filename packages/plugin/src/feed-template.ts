interface Feed {
  id: string;
  timestamp: number;
  affectedVersions: {
    min: string | null;
    max: string | null;
  };
  notifications: AppNotification[];
}

enum AppNotificationTypes {
  warning = 'warning',
  critical = 'critical',
}

interface AppNotification {
  type: keyof typeof AppNotificationTypes;
  message: string;
  conditions: string[];
}

const feed: Feed[] = [
  {
    id: 'uuid',
    timestamp: 16432199329,
    affectedVersions: {
      min: '3.8.0',
      max: '3.8.999',
    },
    notifications: [
      {
        type: 'warning',
        message: 'Please be careful, you have {forms.forms} forms!',
        conditions: ['forms.forms > 2'],
      },
      {
        type: "critical",
        message: 'This is another message roffle',
        conditions: [],
      }
    ],
  },
  {
    id: 'uuid-two',
    timestamp: 16432199329,
    affectedVersions: {
      min: null,
      max: '3.9.0',
    },
    notifications: [
      {
        type: 'critical',
        message: 'Please omg',
        conditions: [
          'forms.forms > 2'
        ],
      }
    ]
  }
];
