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

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Symfony\Component\Serializer\Serializer;
use yii\web\Response;

class NotificationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private NotificationTypesProvider $notificationTypesProvider,
        private Serializer $serializer,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetTypes(): Response
    {
        $types = $this->notificationTypesProvider->getTypes();

        $response = new Response();
        $response->format = Response::FORMAT_JSON;
        $response->content = $this->serializer->serialize($types, 'json');

        return $response;
    }
}
