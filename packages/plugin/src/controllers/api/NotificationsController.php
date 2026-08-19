<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Notifications\Parsers\HtmlTemplateParser;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsPostedContentProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\FormsService;
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
        private FormsService $formsService,
        private NotificationsPostedContentProvider $postedContentProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetOneTemplate(mixed $id = null): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);

        $record = NotificationTemplateRecord::createFormSpecific();
        if (null === $id) {
            $record->name = 'Notification';
            $record->handle = 'notification';

            $fields = $record->toArray();
            $fields = $this->getParsedTwigValues($fields);
            $fields['body'] = $fields['bodyHtml'];
            $fields['autoText'] = true;

            return $this->asSerializedJson($fields);
        }

        $template = $this->notificationTemplateProvider->getNotificationTemplate($id);
        $form = $this->formsService->getFormById($template->getFormId(), $this->request->get('site'));

        $convertableValues = [
            'body' => $template->getBody(),
            'text' => $template->getTextBody(),
            'subject' => $template->getSubject(),
            'fromName' => $template->getFromName(),
            'fromEmail' => $template->getFromEmail(),
            'replyToName' => $template->getReplyToName(),
            'replyToEmail' => $template->getReplyToEmail(),
            'cc' => $template->getCc(),
            'bcc' => $template->getBcc(),
        ];

        $convertableValues = $this->getParsedTwigValues($convertableValues, $form);
        foreach ($convertableValues as $key => $value) {
            $template->{$key} = $value;
        }

        $template->autoText = true;

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

            $formId = $this->request->post('formId');

            return $this->createNewTemplate($formId);
        }

        $settings = $this->settingsService->getSettingsModel();

        if (Settings::EMAIL_TEMPLATE_METHOD_FORM === $settings->emailTemplateMethod) {
            $templates = [];
        } else {
            $database = $this->notificationTemplateProvider->getDatabaseTemplates();
            $file = $this->notificationTemplateProvider->getFileTemplates();

            $templates = array_merge($database, $file);
        }

        $content = [
            'default' => $settings->emailTemplateDefault,
            'templates' => $templates,
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

        $post = $this->postedContentProvider->getConvertedPostWithTwigValues();

        $notification->setAttributes($post);
        $notification->save();

        if ($notification->hasErrors()) {
            foreach ($notification->getErrors() as $attribute => $errorList) {
                $errors->add('notification', $attribute, $errorList);
            }

            throw new ApiException(400, $errors);
        }

        return $this->asSerializedJson($notification);
    }

    private function createNewTemplate(int $formId): Response
    {
        $post = $this->postedContentProvider->getConvertedPostWithTwigValues();

        $handle = $post['handle'] ?? '';
        if (!empty($handle)) {
            do {
                $exists = NotificationTemplateRecord::find()
                    ->where(['handle' => $handle])
                    ->andWhere('"formId" = :formId', [':formId' => $formId])
                    ->exists()
                ;

                if ($exists) {
                    $number = 1;
                    if (preg_match('/^(.*?)-(\d+)$/', $handle, $matches)) {
                        $number = (int) $matches[2] + 1;
                    }

                    $handle = preg_replace('/^(.*?)(-\d+)?$/', '$1-'.$number, $handle);
                    $post['handle'] = $handle;

                    // replace the $post['name'] as well, but use a space and number
                    $post['name'] = preg_replace('/^(.*?)( \d+)?$/', '$1 '.$number, $post['name'] ?? '');
                }
            } while ($exists);
        }

        $record = NotificationTemplateRecord::create();
        $record->formId = $formId;
        $record->setAttributes($post);
        $record->autoText = (bool) $post['autoText'];
        $record->save();

        if ($record->getErrors()) {
            $this->response->statusCode = 405;

            $errors = (new ErrorCollection())->fromRecord('notification', $record);

            throw new ApiException(405, $errors);
        }

        $notification = NotificationTemplate::fromRecord($record);

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $this->serializer->serialize($notification, 'json');

        return $this->response;
    }

    private function getParsedTwigValues(array $values, ?Form $form = null): array
    {
        foreach ($values as $key => $value) {
            if (!\is_string($value)) {
                $value = '';
            }

            $values[$key] = $this->htmlTemplateParser->fromTwig($value, $form);
        }

        return $values;
    }
}
