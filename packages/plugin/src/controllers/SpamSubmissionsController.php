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

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\SpamBlocking\IpAddresses\BlockIpAddresses;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Services\SubmissionsService;
use yii\web\Response;

class SpamSubmissionsController extends SubmissionsController
{
    public const SPAM_TEMPLATE_BASE_PATH = 'freeform/spam';

    public function getSubmissionsService(): SubmissionsService
    {
        return $this->getSpamSubmissionsService();
    }

    public function actionBlockIpAddress(): Response
    {
        $this->requirePostRequest();

        $submission = $this->getSpamSubmissionFromPost();

        $ip = trim((string) $this->request->post('ip'));
        if (!filter_var($ip, \FILTER_VALIDATE_IP)) {
            return $this->asJson([
                'success' => false,
                'message' => Freeform::t('IP Address is not valid.'),
            ]);
        }

        $integrationModel = $this->getOrCreateBlockedIpIntegration();
        if (!$integrationModel) {
            return $this->asJson([
                'success' => false,
                'message' => Freeform::t('Could not create Blocked IP Addresses integration.'),
            ]);
        }

        $globalIps = $this->getMetadataIps($integrationModel->metadata, 'defaultIps');

        $record = $this->getFormIntegrationRecord($submission, $integrationModel);
        $metadata = $this->getRecordMetadata($record);

        $formSpecificIps = $this->getMetadataIps($metadata, 'ips');
        $formDefaultIps = $this->getMetadataIps($metadata, 'defaultIps');

        $alreadyBlocked = \in_array($ip, array_unique(array_merge($globalIps, $formSpecificIps, $formDefaultIps)), true);
        if ($alreadyBlocked) {
            return $this->asJson([
                'success' => true,
                'message' => Freeform::t('IP Address is already blocked.'),
            ]);
        }

        $formSpecificIps[] = $ip;

        $metadata['ips'] = array_values($formSpecificIps);

        $record->enabled = true;
        $record->metadata = json_encode($metadata, \JSON_THROW_ON_ERROR);

        if ($record->save()) {
            return $this->asJson([
                'success' => true,
                'message' => Freeform::t('IP Address blocked successfully.'),
            ]);
        }

        return $this->asJson([
            'success' => false,
            'message' => Freeform::t('Could not block IP Address.'),
        ]);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();

        $id = $this->request->post('id');
        $this->getSubmissionsService()->delete(SpamSubmission::find()->id($id));

        return $this->asJson(['success' => true]);
    }

    public function actionAllow()
    {
        $post = \Craft::$app->request->post();

        $submissionId = $post['submissionId'] ?? null;

        /** @var SpamSubmission $model */
        $model = $this->getSpamSubmissionsService()->getSubmissionById($submissionId);

        if (!$model) {
            throw new FreeformException(Freeform::t('Submission not found'));
        }

        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
            PermissionHelper::requirePermission(
                PermissionHelper::prepareNestedPermission(
                    Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                    $model->formId
                )
            );
        }

        $model->setFormFieldValues($post);
        $model->title = $post['title'] ?? $model->title;
        $model->statusId = $post['statusId'] ?? $model->statusId;

        if ($this->getSpamSubmissionsService()->allowSpamSubmission($model)) {
            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setSuccess(Freeform::t('Submission updated.'));
            \Craft::$app->session->setFlash(Freeform::t('Submission updated.'), true);

            return $this->redirectToPostedUrl($model);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Submission could not be updated.'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(
            [
                'submission' => $model,
                'errors' => $model->getErrors(),
            ]
        );
    }

    protected function getTemplateBasePath(): string
    {
        return self::SPAM_TEMPLATE_BASE_PATH;
    }

    protected function getEditTemplateVariables(Submission $submission): array
    {
        return [
            'isSubmissionIpAddressBlocked' => $this->isSubmissionIpAddressBlocked($submission),
        ];
    }

    private function isSubmissionIpAddressBlocked(Submission $submission): bool
    {
        $ip = trim((string) ($submission->ip ?? ''));
        if (!$ip || !filter_var($ip, \FILTER_VALIDATE_IP)) {
            return false;
        }

        $integrationModel = $this->getIntegrationsService()->getByHandle('blockedIpAddresses');
        if (!$integrationModel) {
            return false;
        }

        // Global integration defaults
        $globalIps = $this->getMetadataIps($integrationModel->metadata, 'defaultIps');
        if (\in_array($ip, $globalIps, true)) {
            return true;
        }

        $record = FormIntegrationRecord::findOne([
            'formId' => $submission->formId,
            'integrationId' => $integrationModel->id,
        ]);

        if (!$record) {
            return false;
        }

        $metadata = $this->getRecordMetadata($record);

        $formSpecificIps = $this->getMetadataIps($metadata, 'ips');
        $formDefaultIps = $this->getMetadataIps($metadata, 'defaultIps');

        $effectiveFormIps = array_unique(array_merge($formSpecificIps, $formDefaultIps));

        return \in_array($ip, $effectiveFormIps, true);
    }

    private function getSpamSubmissionFromPost(): SpamSubmission
    {
        $id = $this->request->post('id');

        /** @var null|SpamSubmission $submission */
        $submission = $this->getSpamSubmissionsService()->getSubmissionById($id);

        if (!$submission) {
            throw new FreeformException(Freeform::t('Submission not found'));
        }

        $this->requireSubmissionManagePermission($submission);

        return $submission;
    }

    private function requireSubmissionManagePermission(Submission $submission): void
    {
        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
            PermissionHelper::requirePermission(
                PermissionHelper::prepareNestedPermission(
                    Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                    $submission->formId
                )
            );
        }
    }

    private function getOrCreateBlockedIpIntegration(): ?IntegrationModel
    {
        $integrationModel = $this->getIntegrationsService()->getByHandle('blockedIpAddresses');
        if ($integrationModel) {
            return $integrationModel;
        }

        $integrationModel = IntegrationModel::create(Type::TYPE_SPAM_BLOCK);
        $integrationModel->name = 'Blocked IP Addresses';
        $integrationModel->handle = 'blockedIpAddresses';
        $integrationModel->class = BlockIpAddresses::class;
        $integrationModel->enabled = true;
        $integrationModel->metadata = [
            'enabledByDefault' => false,
            'defaultIps' => [],
        ];

        $integration = $integrationModel->getIntegrationObject();

        return $this->getIntegrationsService()->save($integrationModel, $integration)
            ? $integrationModel
            : null;
    }

    private function getFormIntegrationRecord(Submission $submission, IntegrationModel $integrationModel): FormIntegrationRecord
    {
        $record = FormIntegrationRecord::findOne([
            'formId' => $submission->formId,
            'integrationId' => $integrationModel->id,
        ]);

        if ($record) {
            return $record;
        }

        $record = new FormIntegrationRecord();
        $record->formId = $submission->formId;
        $record->integrationId = $integrationModel->id;

        return $record;
    }

    private function getMetadataIps(array $metadata, string $key): array
    {
        $ips = $metadata[$key] ?? [];
        if (\is_string($ips)) {
            $ips = preg_split('/\r\n|\r|\n/', $ips);
        }

        if (!\is_array($ips)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map('trim', $ips))));
    }

    private function getRecordMetadata(?FormIntegrationRecord $record): array
    {
        return JsonHelper::decode($record?->metadata ?? '{}', true) ?: [];
    }
}
