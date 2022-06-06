const Minimal = [
  {
    uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
    type: 'layout',
    children: [
      {
        uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
        type: 'row',
        children: [
          {
            uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
            type: 'field',
            children: [],
          },
          {
            uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
            type: 'layout',
            children: [
              {
                uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
                type: 'row',
                children: [
                  {
                    uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
                    type: 'field',
                  },
                  {
                    uid: 'xxxxxxxxx-xxxxx-xxxxx-xxxxxxxxxx',
                    type: 'field',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
const store = {
  pages: [
    {
      uid: 'page-xxxxx',
      handle: 'page1',
      label: 'Page 1',
      layout: 'layout-xxxxx',
    },
  ],
  layouts: [
    {
      uid: 'layout-xxxxx',
      rows: ['row-xxxxx', 'row-xxxxx', 'row-xxxxx'],
    },
    {
      uid: 'layout-xxxxx',
      rows: ['row-xxxxx'],
    },
  ],
  rows: [
    {
      uid: 'row-xxxxx',
      columns: [
        {
          type: 'field',
          uid: 'field-xxxxx',
        },
        {
          type: 'layout',
          uid: 'layout-xxxxx',
        },
        {
          type: 'field',
          uid: 'field-xxxxx',
        },
      ],
    },
  ],
  fields: [
    {
      uid: 'field-xxxxx',
      type: 'Solspace\\Freeform\\Fields\\Text',
      handle: 'xxx',
      label: 'xxx',
      required: false,
      defaultValue: '',
      properties: {
        placeholder: 'xxx',
      },
    },
    {
      uid: 'field-xxxxx',
      type: 'Solspace\\Freeform\\Fields\\MultipleSelect',
      handle: 'xxx',
      label: 'xxx',
      required: false,
      defaultValue: ['xxx'],
      properties: {
        options: [{ key: 'xxx', value: 'xxx' }],
      },
    },
  ],
};
