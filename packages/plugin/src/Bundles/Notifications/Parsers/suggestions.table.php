<?php

return [
    [
        'name' => 'Submission',
        'items' => [
            ['token' => 'submission.id', 'name' => 'Submission ID', 'shortName' => 'ID'],
            ['token' => 'submission.incrementalId', 'name' => 'Submission Incremental ID', 'shortName' => 'Incremental ID'],
            ['token' => 'submission.token', 'name' => 'Submission Token', 'shortName' => 'Token'],
            ['token' => 'submission.title', 'name' => 'Submission Title', 'shortName' => 'Title'],
            ['token' => "submission.dateCreated.format('F j, Y')", 'name' => 'Submission Date Created', 'shortName' => 'Date Created'],
            ['token' => 'submission.status', 'name' => 'Submission Status', 'shortName' => 'Status'],
            ['token' => 'submission.cpEditUrl', 'name' => 'Submission CP URL', 'shortName' => 'CP URL'],
            ['token' => 'submission.userId', 'name' => 'Submission User ID', 'shortName' => 'User ID'],
            ['token' => 'submission.ip', 'name' => 'Submission IP Address', 'shortName' => 'IP Address'],
            ['token' => 'submission.sourceUrl', 'name' => 'Submission Source URL', 'shortName' => 'Source URL'],
        ],
    ],
    [
        'name' => 'Form',
        'items' => [
            ['token' => 'form.id', 'name' => 'Form ID', 'shortName' => 'ID'],
            ['token' => 'form.name', 'name' => 'Form Name', 'shortName' => 'Name'],
            ['token' => 'form.handle', 'name' => 'Form Handle', 'shortName' => 'Handle'],
            ['token' => 'form.color', 'name' => 'Form Color', 'shortName' => 'Color'],
            ['token' => 'form.description', 'name' => 'Form Description', 'shortName' => 'Description'],
            ['token' => 'form.type', 'name' => 'Form Type', 'shortName' => 'Type'],
        ],
    ],
    [
        'name' => 'Predefined',
        'items' => [
            ['token' => 'loops.fields.all', 'name' => 'All Fields', 'shortName' => 'All Fields'],
            ['token' => 'loops.fields.withHtml', 'name' => 'All Fields with HTML & Rich Text', 'shortName' => 'All Fields with HTML & Rich Text'],
            ['token' => 'loops.fields.nonEmpty', 'name' => 'All Non-empty Fields', 'shortName' => 'All Non-empty Fields'],
            ['token' => 'loops.fields.withRules', 'name' => 'All Rules Visible Fields', 'shortName' => 'All Rules Visible Fields'],
        ],
    ],
    [
        'name' => 'General',
        'items' => [
            ['token' => 'general.systemName', 'name' => 'System Name', 'shortName' => 'System Name'],
            ['token' => 'general.systemEmail', 'name' => 'System Email', 'shortName' => 'System Email'],
            ['token' => 'general.systemReplyToEmail', 'name' => 'System Reply-To Email', 'shortName' => 'Reply-To Email'],
            ['token' => 'general.siteName', 'name' => 'Site Name', 'shortName' => 'Site Name'],
            ['token' => 'general.siteHandle', 'name' => 'Site Handle', 'shortName' => 'Site Handle'],
            ['token' => 'general.dateMDY', 'name' => 'Date (MM/DD/YYYY)', 'shortName' => 'Date (MM/DD/YYYY)'],
            ['token' => 'general.dateDMY', 'name' => 'Date (DD/MM/YYYY)', 'shortName' => 'Date (DD/MM/YYYY)'],
            ['token' => 'general.dateLong', 'name' => 'Date (Month Day, Year)', 'shortName' => 'Date (Month Day, Year)'],
            ['token' => 'general.time12', 'name' => 'Time (12h)', 'shortName' => 'Time (12h)'],
            ['token' => 'general.time24', 'name' => 'Time (24h)', 'shortName' => 'Time (24h)'],
        ],
    ],
];
