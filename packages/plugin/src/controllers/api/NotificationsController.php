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

use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Notifications\Parsers\HtmlTemplateParser;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsPostedContentProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Codepack\MessageTemplateSamples;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;
use Symfony\Component\Serializer\Serializer;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
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
        private LimitedUserChecker $limitedUserChecker,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetOneTemplate(mixed $id = null): Response
    {
        $this->requireCpRequest();
        $formId = $this->request->getQueryParam('formId');
        $site = $this->request->getQueryParam('site');

        if (null === $id) {
            $this->requireTemplateCreation();
            $this->requireManageTemplateForm($this->validateId($formId), $site);

            $record = NotificationTemplateRecord::createFormSpecific();
            $record->name = 'Notification';
            $record->handle = 'notification';

            $fields = $record->toArray();
            $fields = $this->getParsedTwigValues($fields);
            $fields['body'] = $fields['bodyHtml'];
            $fields['autoText'] = true;
            $fields['samples'] = [];
            foreach (MessageTemplateSamples::options('email') as $sampleId => $sample) {
                $fields['samples'][] = [
                    'id' => $sampleId,
                    'name' => Freeform::t($sample['name']),
                    'fields' => $this->getParsedTwigValues(MessageTemplateSamples::formEmail($sampleId)),
                ];
            }

            return $this->asSerializedJson($fields);
        }

        $record = NotificationTemplateRecord::findOne(['id' => $this->validateId($id)]);
        $ownerId = $this->requireTemplateOwner($record, $formId);
        $form = $this->requireManageTemplateForm($ownerId, $site);
        $template = NotificationTemplate::fromRecord($record);

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
        if ($this->request->getIsPost()) {
            $this->requireCpRequest();
            $id = $this->request->post('id');
            $formId = $this->request->post('formId');
            $site = $this->request->post('site');

            if (null !== $id) {
                return $this->editTemplate($this->validateId($id), $formId, $site);
            }

            $this->requireTemplateCreation();
            $formId = $this->validateId($formId);
            $this->requireManageTemplateForm($formId, $site);

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

    private function editTemplate(int $id, mixed $formId, mixed $site): Response
    {
        $errors = new ErrorCollection();

        $notification = NotificationTemplateRecord::findOne(['id' => $id]);
        if (!$notification) {
            $errors->add('notification', 'name', ['Notification not found']);

            throw new ApiException(404, $errors);
        }

        $ownerId = $this->requireTemplateOwner($notification, $formId);
        $this->requireManageTemplateForm($ownerId, $site);

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

    private function requireTemplateCreation(): void
    {
        $settings = $this->settingsService->getSettingsModel();
        if (!$settings->allowBuilderTemplateCreation || Settings::EMAIL_TEMPLATE_METHOD_GLOBAL === $settings->emailTemplateMethod) {
            throw new ForbiddenHttpException('Form template creation is disabled.');
        }
    }

    private function requireTemplateOwner(?NotificationTemplateRecord $template, mixed $formId): int
    {
        $ownerId = (int) $template?->formId;
        if (!$ownerId || (null !== $formId && $this->validateId($formId) !== $ownerId)) {
            throw new NotFoundHttpException('Form template not found.');
        }

        return $ownerId;
    }

    private function requireManageTemplateForm(int $formId, mixed $site): Form
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $permission = Freeform::PERMISSION_FORMS_MANAGE;
        if ((!PermissionHelper::checkPermission($permission)
            && !PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission($permission, $formId)))
            || !$this->limitedUserChecker->can('notifications.tab')) {
            throw new ForbiddenHttpException('User is not permitted to manage notifications for this form.');
        }

        if (null !== $site && (!\is_string($site) || '' === $site)) {
            throw new BadRequestHttpException('Invalid site.');
        }

        $site ??= \Craft::$app->getSites()->getCurrentSite()->handle;
        if (!\in_array($site, SitesHelper::getEditableSiteHandles(), true)) {
            throw new ForbiddenHttpException('User is not permitted to edit this site.');
        }

        $form = $this->formsService->getFormById($formId, SitesHelper::isEnabled() ? $site : null);
        if (!$form) {
            throw new NotFoundHttpException('Form not found.');
        }

        return $form;
    }

    private function validateId(mixed $id): int
    {
        if ((!\is_int($id) && !\is_string($id)) || false === ($id = filter_var($id, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]))) {
            throw new BadRequestHttpException('Invalid form or template ID.');
        }

        return $id;
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
