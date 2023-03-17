<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationDTOProvider;
use Solspace\Freeform\controllers\BaseApiController;

class NotificationsController extends BaseApiController
{
    public function __construct($id, $module, $config = [], private NotificationDTOProvider $notificationDTOProvider)
    {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array
    {
        return $this->notificationDTOProvider->getByCategory();
    }

    protected function getOne(int|string $id): array|object|null
    {
        return $this->notificationDTOProvider->getById($id);
    }
}
