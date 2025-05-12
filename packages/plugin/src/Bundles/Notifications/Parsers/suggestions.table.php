<?php

return [
    [
        'name' => 'Submission',
        'items' => [
            ['token' => 'submission.id', 'name' => 'Submission ID', 'shortName' => 'ID'],
            ['token' => 'submission.title', 'name' => 'Submission Title', 'shortName' => 'Title'],
            ['token' => 'submission.date', 'name' => 'Submission Date', 'shortName' => 'Date'],
            ['token' => 'submission.status', 'name' => 'Submission Status', 'shortName' => 'Status'],
            ['token' => 'submission.cpUrl', 'name' => 'Submission CP URL', 'shortName' => 'CP URL'],
            ['token' => 'submission.dateCreated', 'name' => 'Submission Date', 'shortName' => 'Date Created'],
        ],
    ],
    [
        'name' => 'Form',
        'items' => [
            ['token' => 'form.id', 'name' => 'Form ID', 'shortName' => 'ID'],
            ['token' => 'form.name', 'name' => 'Form Name', 'shortName' => 'Name'],
            ['token' => 'form.handle', 'name' => 'Form Handle', 'shortName' => 'Handle'],
        ],
    ],
    [
        'name' => 'Predefined',
        'items' => [
            ['token' => 'loop.field.all', 'name' => 'All Fields', 'shortName' => 'All Fields'],
            ['token' => 'loop.field.allNonEmpty', 'name' => 'All Non-empty Fields', 'shortName' => 'All Non-empty Fields'],
            ['token' => 'loop.field.visible', 'name' => 'All Visible Fields', 'shortName' => 'All Visible Fields'],
        ],
    ],
];
