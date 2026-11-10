<?php

namespace Solspace\Freeform\controllers\api;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use craft\helpers\UrlHelper;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\FormCardHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Services\FormCardAnalyticsService;
use yii\db\Expression;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class FormCardsController extends BaseApiController
{
    public function actionStats(): Response
    {
        $this->requirePro();
        $this->requireCpRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        $siteId = $this->getSiteId($this->request->getQueryParam('siteId'));
        $site = \Craft::$app->sites->getSiteById($siteId);
        $forms = $this->getFormsService()->getAllNonArchivedForms(sites: SitesHelper::isEnabled() ? $site->handle : null);
        $forms = array_filter($forms, fn ($form, $id) => null === $form->getDateArchived() && $this->canSeeForm($id), \ARRAY_FILTER_USE_BOTH);
        $statusIds = array_keys(array_filter($forms, fn ($form) => $this->canReadSubmissions($form->getId())));
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return $this->asJson(\Craft::$container->get(FormCardAnalyticsService::class)->getStats(array_keys($forms), $this->getDays(), $statusIds));
    }

    public function actionSaveRange(): Response
    {
        $this->requirePro();
        $this->requireCpRequest();
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        $siteId = $this->getSiteId($this->request->post('siteId'));
        $days = filter_var($this->request->post('days'), \FILTER_VALIDATE_INT);
        if (!\in_array($days, FormCardHelper::RANGES, true)) {
            throw new BadRequestHttpException('Invalid chart range');
        }
        \Craft::$app->getUsers()->saveUserPreferences(\Craft::$app->getUser()->getIdentity(), [FormCardHelper::rangeKey($siteId) => $days]);

        return $this->asJson(['days' => $days]);
    }

    public function actionSavePreferences(): Response
    {
        $this->requirePro();
        $this->requireCpRequest();
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        $siteId = $this->getSiteId($this->request->post('siteId'));
        $id = filter_var($this->request->post('formId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $site = \Craft::$app->sites->getSiteById($siteId);
        $forms = $this->getFormsService()->getAllNonArchivedForms(sites: SitesHelper::isEnabled() ? $site->handle : null);
        $form = $id ? ($forms[$id] ?? null) : null;
        if (!$form || $form->getDateArchived() !== null) {
            throw new BadRequestHttpException('Form is no longer available');
        }
        $content = $this->request->post('content');
        $fieldId = $this->request->post('fieldId');
        if (!\in_array($content, FormCardHelper::CONTENT, true)) {
            throw new BadRequestHttpException('Invalid card content');
        }
        if (\in_array($content, ['activity', 'statistics', 'field'], true) && !$this->canReadSubmissions($id)) {
            throw new ForbiddenHttpException('User cannot access these submissions');
        }
        if ($content === 'field') {
            $fieldId = filter_var($fieldId, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            $fields = \Craft::$container->get(FormCardAnalyticsService::class)->getFields($form);
            if (!$fieldId || !\in_array($fieldId, array_column($fields, 'id'), true)) {
                throw new BadRequestHttpException('Choose an available summary field');
            }
        } else {
            $fieldId = null;
        }
        $preference = ['content' => $content, 'fieldId' => $fieldId];
        \Craft::$app->getUsers()->saveUserPreferences(\Craft::$app->getUser()->getIdentity(), [FormCardHelper::contentKey($siteId, $form->getUid()) => $preference]);

        return $this->asJson($preference);
    }

    public function actionFields(int $id): Response
    {
        $this->requirePro();
        $form = $this->requireSubmissionForm($id);

        return $this->asJson(\Craft::$container->get(FormCardAnalyticsService::class)->getFields($form));
    }

    public function actionFieldSummary(int $id): Response
    {
        $this->requirePro();
        $form = $this->requireSubmissionForm($id);
        $fieldId = filter_var($this->request->getQueryParam('fieldId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$fieldId) {
            throw new BadRequestHttpException('Choose an available summary field');
        }

        return $this->asJson(\Craft::$container->get(FormCardAnalyticsService::class)->getFieldSummary($form, $fieldId, $this->getDays()));
    }

    public function actionSaveSize(): Response
    {
        $this->requirePro();
        $this->requireCpRequest();
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $formId = filter_var($this->request->post('formId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $siteId = filter_var($this->request->post('siteId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $size = $this->request->post('size');
        if (!$formId || !$siteId || !\in_array($size, FormCardHelper::SIZES, true)) {
            throw new BadRequestHttpException('Invalid form card size');
        }
        if (!\in_array($siteId, SitesHelper::getEditableSiteIds(), true)) {
            throw new ForbiddenHttpException('User cannot access this site');
        }

        $site = \Craft::$app->sites->getSiteById($siteId);
        $forms = $this->getFormsService()->getAllNonArchivedForms(sites: SitesHelper::isEnabled() ? $site->handle : null);
        $form = $forms[$formId] ?? null;
        if (!$form) {
            throw new NotFoundHttpException('Form is no longer available in this site');
        }

        $user = \Craft::$app->getUser()->getIdentity();
        \Craft::$app->getUsers()->saveUserPreferences($user, [FormCardHelper::preferenceKey($siteId, $form->getUid()) => $size]);
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return $this->asJson(['size' => $size]);
    }

    public function actionActivity(int $id): Response
    {
        $this->requirePro();
        $this->requireCpRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)
            && !PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE, $id))) {
            throw new ForbiddenHttpException('User cannot access these submissions');
        }
        if (!$this->getFormsService()->getFormById($id)) {
            throw new NotFoundHttpException('Form is no longer available');
        }

        $siteId = $this->getSiteId($this->request->getQueryParam('siteId', \Craft::$app->sites->getCurrentSite()->id));
        $end = Carbon::now('UTC');
        $start = $end->copy()->startOfDay()->subDays($this->getDays() - 1);
        // Titles and timestamps only; field values are never loaded for activity.
        $rows = (new Query())
            ->select(['s.id', 's.dateCreated', 'statusName' => 'status.name', 'statusColor' => 'status.color', 'title' => new Expression('COALESCE(MAX(CASE WHEN es.[[siteId]] = :siteId THEN es.[[title]] END), MAX(es.[[title]]))', [':siteId' => $siteId])])
            ->from(['s' => Submission::TABLE])
            ->innerJoin(['e' => Table::ELEMENTS], 'e.[[id]] = s.[[id]]')
            ->leftJoin(['es' => Table::ELEMENTS_SITES], 'es.[[elementId]]=s.[[id]]')
            ->leftJoin(['status' => StatusRecord::TABLE], 'status.[[id]]=s.[[statusId]]')
            ->where(['s.formId' => $id, 's.isHidden' => false, 's.isSpam' => false, 'e.dateDeleted' => null])
            ->andWhere(['between', 's.dateCreated', $start->toDateTimeString(), $end->toDateTimeString()])
            ->orderBy(['s.dateCreated' => \SORT_DESC, 's.id' => \SORT_DESC])
            ->limit(3)
            ->groupBy(['s.id', 's.dateCreated', 'status.name', 'status.color'])
            ->all()
        ;
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return $this->asJson(['submissions' => array_map(static fn ($row) => ['id' => (int) $row['id'], 'title' => $row['title'] ?: Freeform::t('Submission #{id}', ['id' => $row['id']]), 'createdAt' => Carbon::parse($row['dateCreated'], 'UTC')->toIso8601String(), 'url' => UrlHelper::cpUrl('freeform/submissions/'.$row['id']), 'status' => ['name' => $row['statusName'] ?: Freeform::t('Unknown status'), 'color' => \in_array($row['statusColor'], StatusRecord::getAllowedColors(), true) ? $row['statusColor'] : 'gray']], $rows)]);
    }

    private function requirePro(): void
    {
        if (!Freeform::getInstance()->isPro()) {
            throw new ForbiddenHttpException('Dashboard customization requires Freeform Pro.');
        }
    }

    private function requireSubmissionForm(int $id): Form
    {
        $this->requireCpRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        if (!$this->canReadSubmissions($id)) {
            throw new ForbiddenHttpException('User cannot access these submissions');
        }
        $siteId = $this->getSiteId($this->request->getQueryParam('siteId', \Craft::$app->sites->getCurrentSite()->id));
        $site = \Craft::$app->sites->getSiteById($siteId);
        $form = $this->getFormsService()->getFormById($id, SitesHelper::isEnabled() ? $site->handle : null);
        if (!$form) {
            throw new NotFoundHttpException('Form is no longer available');
        }
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return $form;
    }

    private function canReadSubmissions(int $id): bool
    {
        return PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE) || PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE, $id));
    }

    private function canSeeForm(int $id): bool
    {
        foreach ([Freeform::PERMISSION_FORMS_MANAGE, Freeform::PERMISSION_SUBMISSIONS_READ, Freeform::PERMISSION_SUBMISSIONS_MANAGE] as $permission) {
            if (PermissionHelper::checkPermission($permission) || PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission($permission, $id))) {
                return true;
            }
        }

        return false;
    }

    private function getDays(): int
    {
        $days = filter_var($this->request->getQueryParam('days', 30), \FILTER_VALIDATE_INT);
        if (!\in_array($days, FormCardHelper::RANGES, true)) {
            throw new BadRequestHttpException('Invalid chart range');
        }

        return $days;
    }

    private function getSiteId(mixed $value): int
    {
        $siteId = filter_var($value, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$siteId) {
            throw new BadRequestHttpException('Invalid site');
        }
        if (!\in_array($siteId, SitesHelper::getEditableSiteIds(), true)) {
            throw new ForbiddenHttpException('User cannot access this site');
        }

        return $siteId;
    }
}
