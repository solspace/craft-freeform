<?php

return [
    'freeform/api/forms/<handle:[\w\-]+>/manifest' => 'freeform/api/headless/manifest/get',
    'freeform/api/forms/<handle:[\w\-]+>/submit' => 'freeform/api/headless/submit/post',
    'freeform/api/manifests/<profile:[\w\-]+>/manifest' => 'freeform/api/headless/profile-manifest/get',
    'freeform/api/manifests/<profile:[\w\-]+>/submit' => 'freeform/api/headless/profile-submit/post',
    'freeform/api/headless/spike/multipart' => 'freeform/api/headless/spike/multipart-spike',
];
