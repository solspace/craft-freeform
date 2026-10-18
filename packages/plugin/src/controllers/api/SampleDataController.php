<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\SampleDataService;

class SampleDataController extends BaseApiController
{
    protected function get(): array
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $siteId = (int) $this->request->get('siteId');
        $site = \Craft::$app->getSites()->getSiteById($siteId);
        $locale = $site?->language ?? \Craft::$app->getLocale()->id;

        return (new SampleDataService())->getCatalog($locale);
    }
}
