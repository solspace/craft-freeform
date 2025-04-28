<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Notifications\Parsers\HtmlTemplateParser;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationException;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\SettingsService;
use Symfony\Component\Serializer\Serializer;
use yii\web\Response;

class NotificationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private NotificationTypesProvider $notificationTypesProvider,
        private NotificationTemplateProvider $notificationTemplateProvider,
        private SettingsService $settingsService,
        private Serializer $serializer,
        private HtmlTemplateParser $htmlTemplateParser,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetOneTemplate(mixed $id): Response
    {
        $template = $this->notificationTemplateProvider->getNotificationTemplate($id);
        $template->body = $this->htmlTemplateParser->fromTwig($template->getBody());

        return $this->asSerializedJson($template);
    }

    public function actionGetTypes(): Response
    {
        $types = $this->notificationTypesProvider->getTypes();

        $response = new Response();
        $response->format = Response::FORMAT_JSON;
        $response->content = $this->serializer->serialize($types, 'json');

        return $response;
    }

    public function actionGetTemplates(): Response
    {
        if ('POST' === $this->request->method) {
            $id = $this->request->post('id');
            if ($id) {
                return $this->editTemplate($id);
            }

            return $this->createNewTemplate();
        }

        $database = $this->notificationTemplateProvider->getDatabaseTemplates();
        $file = $this->notificationTemplateProvider->getFileTemplates();

        $settings = $this->settingsService->getSettingsModel();

        $allowedTypes = [];

        switch ($settings->emailTemplateStorageType) {
            case Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE:
                $allowedTypes[] = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE;

                break;

            case Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES:
                $allowedTypes[] = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES;

                break;

            case Settings::EMAIL_TEMPLATE_STORAGE_TYPE_BOTH:
            default:
                $allowedTypes[] = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE;
                $allowedTypes[] = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES;

                break;
        }

        $content = [
            'allowedTypes' => $allowedTypes,
            'default' => $settings->emailTemplateDefault,
            'templates' => [
                'database' => $database,
                'files' => $file,
            ],
        ];

        $response = new Response();
        $response->format = Response::FORMAT_JSON;
        $response->content = $this->serializer->serialize($content, 'json');

        return $response;
    }

    private function editTemplate(mixed $id): Response
    {
        $errors = new ErrorCollection();

        $notification = NotificationTemplateRecord::findOne(['id' => $id]);
        if (!$notification) {
            $errors->add('notification', 'name', ['Notification not found']);

            throw new ApiException(404, $errors);
        }

        $post = $this->request->post();
        $post['bodyHtml'] = $this->htmlTemplateParser->toTwig($post['body'] ?? '');

        $notification->setAttributes($post);
        $notification->save();

        return $this->asSerializedJson($notification);
    }

    private function createNewTemplate(): Response
    {
        $request = $this->request;
        $errors = [];

        $name = $request->post('name');

        if (!$name) {
            $errors[] = Freeform::t('Name is required');
        }

        $record = null;
        $iterator = 1;

        do {
            try {
                $record = $this->getNotificationsService()->create($name);
            } catch (NotificationException $e) {
                switch ($e->getCode()) {
                    case NotificationException::NO_EMAIL_DIR:
                    case NotificationException::NO_CONTENT:
                        $errors[] = $e->getMessage();

                        break 2;
                }
            }

            $name = preg_replace('/\s\d+$/', '', $name);
            $name = $name.' '.$iterator++;
        } while (!$record);

        if ($errors) {
            $this->response->statusCode = 405;

            return $this->asJson(['errors' => $errors]);
        }

        $notification = NotificationTemplate::fromRecord($record);

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $this->serializer->serialize($notification, 'json');

        return $this->response;
    }
}
