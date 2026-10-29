<?php

namespace Solspace\Freeform\controllers;

use craft\db\Query;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\PurgeActivityJob;
use Solspace\Freeform\Library\Activity\ActivityExamples;
use Solspace\Freeform\Library\Activity\ActivityExport;
use Solspace\Freeform\Library\Activity\ActivityFeed;
use Solspace\Freeform\Library\Activity\ActivityInput;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityPresentation;
use Solspace\Freeform\Library\Activity\ActivityQuery;
use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Resources\Bundles\ActivityBundle;
use Solspace\Freeform\Services\ActivityService;
use yii\db\Expression;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class ActivityController extends BaseController
{
    private array $integrationNames = [];
    private array $notificationNames = [];
    private array $resolvedIntegrations = [];
    private array $resolvedNotifications = [];

    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }
        $this->requireCpRequest();
        $this->requireLogin();
        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS)) {
            PermissionHelper::requirePermission(Freeform::PERMISSION_ACTIVITY_ACCESS);
        }
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return true;
    }

    public function actionIndex(): Response
    {
        \Craft::$app->getView()->registerAssetBundle(ActivityBundle::class);
        $request = \Craft::$app->getRequest();
        $resultsOnly = '1' === $request->getHeaders()->get('X-Freeform-Activity-Results');
        $settings = $this->getSettingsService()->getSettingsModel();

        try {
            $filters = ActivityInput::filters($request->getQueryParams());
            $before = ActivityInput::id($request->getQueryParam('before', 0));
            $after = ActivityInput::id($request->getQueryParam('after', 0));
            if ($before && $after) {
                throw new \InvalidArgumentException('Invalid activity cursor.');
            }
            $pageNumber = ($before || $after) ? max(1, ActivityInput::id($request->getQueryParam('page', $before ? 2 : 1))) : 1;
            $selectedId = ActivityInput::id($request->getQueryParam('eventId', 0));
            $view = $request->getQueryParam('view', 'submissions');
            if (!\is_string($view) || !\in_array($view, ['submissions', 'events'], true)) {
                throw new \InvalidArgumentException('Invalid activity view.');
            }
            $filters['view'] = $view;
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException($exception->getMessage());
        }
        $rows = $timeline = [];
        $selected = null;
        $unavailable = $hasMore = false;
        $throughId = $nextCursor = $previousCursor = $total = 0;

        try {
            $query = ActivityQuery::filtered($filters, ActivityService::cutoff($settings));
            $page = ActivityFeed::page($query, ActivityService::cutoff($settings), $before, 'submissions' === $view, $after);
            $rows = $page['rows'];
            $hasMore = $page['hasMore'];
            $nextCursor = $page['nextCursor'];
            $previousCursor = $page['previousCursor'];
            $total = $page['total'];
            $throughId = (int) (new Query())->from(ActivityTable::TABLE)->max('id');
            $this->loadContextNames($rows);
            foreach ($rows as &$row) {
                $row = $this->present($row);
                if ((int) $row['id'] === $selectedId) {
                    $selected = $row;
                }
            }
            unset($row);
            // A timeline step can be selected without replacing the submission's summary.
            if (!$selected && $selectedId && 'submissions' === $view) {
                $candidate = (new Query())->from(ActivityTable::TABLE)->where(['id' => $selectedId])
                    ->andWhere(['>=', 'dateCreated', ActivityService::cutoff($settings)])->one()
                ;
                if ($candidate) {
                    $chainKey = ActivityFeed::chainKey($candidate);
                    foreach ($rows as $row) {
                        if ($row['chainKey'] === $chainKey) {
                            $this->loadContextNames([$candidate]);
                            $selected = $this->present($candidate + ['chainKey' => $chainKey]);

                            break;
                        }
                    }
                }
            }
            $selected ??= $rows[0] ?? null;
            if ($selected && $selected['submissionId']) {
                $timeline = (new Query())->from(ActivityTable::TABLE)
                    ->where(['submissionId' => $selected['submissionId'], 'formId' => $selected['formId']])
                    ->andWhere(['>=', 'dateCreated', ActivityService::cutoff($settings)])
                    ->orderBy(['id' => \SORT_DESC])->limit(30)->all()
                ;
                $this->loadContextNames($timeline);
                $timeline = array_map([$this, 'present'], array_reverse($timeline));
            }
        } catch (\Throwable) {
            $rows = $timeline = [];
            $selected = null;
            $unavailable = true;
        }

        $canReadSubmission = false;
        $canManageForm = false;
        if ($selected && $selected['formId'] && PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)) {
            foreach ([Freeform::PERMISSION_SUBMISSIONS_READ, Freeform::PERMISSION_SUBMISSIONS_MANAGE] as $permission) {
                $canReadSubmission = $canReadSubmission || PermissionHelper::checkPermission($permission)
                    || PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission($permission, $selected['formId']));
            }
        }
        if ($selected && $selected['formId'] && PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS)) {
            $canManageForm = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE)
                || PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_FORMS_MANAGE, $selected['formId']));
        }

        $formColors = [];
        if ($resultsOnly) {
            $formIds = array_values(array_unique(array_filter(array_column($rows, 'formId'))));
            $formNames = $formIds ? $this->getFormsService()->getFormQuery()->select(['forms.id', 'forms.name'])->andWhere(['forms.id' => $formIds])->pairs() : [];
            if ($unavailable) {
                \Craft::$app->getResponse()->setStatusCode(503);
            }
        } else {
            try {
                $color = 'pgsql' === \Craft::$app->getDb()->getDriverName()
                    ? new Expression("SUBSTRING(CAST([[forms.metadata]] AS JSONB)->'general'->>'color', 1, 16)")
                    : new Expression("SUBSTRING(JSON_UNQUOTE(JSON_EXTRACT([[forms.metadata]], '$.general.color')), 1, 16)");
                $formRows = $this->getFormsService()->getFormQuery()->select(['forms.id', 'forms.name', 'color' => $color])->all();
                $formNames = [];
                foreach ($formRows as $formRow) {
                    $id = (int) $formRow['id'];
                    $formNames[$id] = $formRow['name'];
                    $formColors[$id] = \is_string($formRow['color']) && preg_match('/^#[a-f0-9]{3}(?:[a-f0-9]{3})?$/i', $formRow['color']) ? $formRow['color'] : '#64748b';
                }
                natcasesort($formNames);
            } catch (\Throwable) {
                // An optional color must never make the log unavailable.
                $formNames = $this->getFormsService()->getAllFormNames(orderByName: true);
            }
        }

        $pageNumber = min($pageNumber, max(1, (int) ceil($total / ActivityFeed::PAGE_SIZE)));
        $first = $rows ? ($pageNumber - 1) * ActivityFeed::PAGE_SIZE + 1 : 0;
        $pageInfo = [
            'total' => $total, 'first' => $first, 'last' => $rows ? min($total, $first + \count($rows) - 1) : 0,
            'prevUrl' => $rows && $pageNumber > 1 ? UrlHelper::cpUrl('freeform/activity', array_merge($filters, ['after' => $previousCursor, 'page' => $pageNumber - 1])) : null,
            'nextUrl' => $rows && $pageNumber * ActivityFeed::PAGE_SIZE < $total ? UrlHelper::cpUrl('freeform/activity', array_merge($filters, ['before' => $nextCursor, 'page' => $pageNumber + 1])) : null,
        ];

        return $this->renderTemplate($resultsOnly ? 'freeform/activity/_results' : 'freeform/activity/index', [
            'names' => ActivityPolicy::CATEGORY_LABELS,
            'levels' => ActivityPolicy::LEVEL_LABELS,
            'activityView' => $view,
            'total' => $total,
            'pageInfo' => $pageInfo,
            'pageNumber' => $pageNumber,
            'after' => $after,
            'rows' => $rows,
            'selected' => $selected,
            'timeline' => $timeline,
            'hasMore' => $hasMore,
            'nextCursor' => $nextCursor,
            'before' => $before,
            'throughId' => $throughId,
            'exportLimit' => ActivityExport::LIMIT,
            'filters' => $filters,
            'unavailable' => $unavailable,
            'activityEnabled' => BooleanHelper::normalize($settings->activityEnabled),
            'settings' => $settings,
            'forms' => $formNames,
            'formColors' => $formColors,
            'canConfigure' => PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS),
            'canManage' => PermissionHelper::checkPermission(Freeform::PERMISSION_ACTIVITY_MANAGE),
            'canReadSubmission' => $canReadSubmission,
            'canManageForm' => $canManageForm,
            'canAccessIntegrations' => PermissionHelper::checkPermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS),
        ]);
    }

    public function actionSettings(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        \Craft::$app->getView()->registerAssetBundle(ActivityBundle::class);

        return $this->renderSettings($this->getSettingsService()->getSettingsModel());
    }

    public function actionSaveSettings(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        if (!$this->getSettingsService()->isAllowAdminEdit()) {
            throw new ForbiddenHttpException('Settings cannot be changed in this environment.');
        }
        $body = \Craft::$app->getRequest()->getBodyParam('settings', []);
        if (!\is_array($body) || !\is_string($body['activityMode'] ?? null) || !\in_array($body['activityMode'], ActivityPolicy::MODES, true)) {
            throw new BadRequestHttpException('Invalid activity mode.');
        }

        try {
            $enabled = ActivityInput::enabled($body['activityEnabled'] ?? '0');
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException($exception->getMessage());
        }
        $data = [
            'activityMode' => $body['activityMode'],
            'activityEnabled' => $enabled,
            'activityRetentionDays' => filter_var($body['activityRetentionDays'] ?? null, \FILTER_VALIDATE_INT) ?: 0,
            'activityMaxRows' => filter_var($body['activityMaxRows'] ?? null, \FILTER_VALIDATE_INT) ?: 0,
        ];
        if ('custom' === $data['activityMode']) {
            if (!\is_array($body['activityEvents'] ?? null)) {
                throw new BadRequestHttpException('Invalid activity event settings.');
            }
            $data['activityEvents'] = $body['activityEvents'];
        }
        $settings = clone $this->getSettingsService()->getSettingsModel();
        $settings->setAttributes($data, false);
        if (!$settings->validate()) {
            \Craft::$app->getView()->registerAssetBundle(ActivityBundle::class);
            \Craft::$app->getSession()->setError(Freeform::t('Activity settings could not be saved.'));

            return $this->renderSettings($settings);
        }
        if (!$this->getSettingsService()->saveSettings($data)) {
            \Craft::$app->getView()->registerAssetBundle(ActivityBundle::class);
            \Craft::$app->getSession()->setError(Freeform::t('Activity settings could not be saved.'));

            return $this->renderSettings($settings);
        }
        \Craft::$app->getSession()->setNotice(Freeform::t('Activity settings saved. Recording changes apply to future events. Storage limits apply to existing history during background cleanup.'));

        return $this->redirect(UrlHelper::cpUrl('freeform/settings/activity'));
    }

    public function actionExport(): Response
    {
        $request = \Craft::$app->getRequest();

        try {
            $filters = ActivityInput::filters($request->getQueryParams());
            $format = $request->getQueryParam('exportFormat', 'csv');
            if (!\is_string($format) || !\in_array($format, ['csv', 'json'], true)) {
                throw new \InvalidArgumentException('Invalid activity export format.');
            }
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException($exception->getMessage());
        }
        // Spill beyond 1 MiB into an automatically removed private temporary file.
        // Buffering here releases every database query before sending the download.
        $stream = fopen('php://temp/maxmemory:1048576', 'w+');
        if (false === $stream) {
            throw new \RuntimeException('Activity export could not be created.');
        }

        try {
            $query = ActivityQuery::filtered($filters, ActivityService::cutoff($this->getSettingsService()->getSettingsModel()));
            ActivityExport::write($stream, ActivityExport::rows($query), $format);
            rewind($stream);

            return $this->response->sendStreamAsFile($stream, 'freeform-activity-'.gmdate('Ymd-His').'.'.$format, [
                'mimeType' => 'json' === $format ? 'application/json' : 'text/csv; charset=UTF-8',
            ]);
        } catch (\Throwable $exception) {
            fclose($stream);

            throw $exception;
        }
    }

    public function actionClear(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_ACTIVITY_MANAGE);

        // Clear only records that existed when the page was rendered, in bounded batches.
        try {
            $throughId = ActivityInput::id(\Craft::$app->getRequest()->getBodyParam('throughId', 0));
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException($exception->getMessage());
        }
        $throughId = min($throughId, (int) (new Query())->from(ActivityTable::TABLE)->max('id'));
        \Craft::$app->getQueue()->push(new PurgeActivityJob(['throughId' => $throughId]));
        \Craft::$app->getSession()->setNotice(Freeform::t('Activity cleanup is queued. Existing history will be cleared in the background. New events and technical log files will be kept.'));

        return $this->redirect(UrlHelper::cpUrl('freeform/activity'));
    }

    public function present(array $row): array
    {
        return ActivityPresentation::present($row, [], $this->integrationNames, $this->notificationNames);
    }

    /** Resolve current labels in bounded batches; names and notification payloads are not stored. */
    private function loadContextNames(array $rows): void
    {
        $integrations = $notifications = [];
        foreach ($rows as $row) {
            $metadata = \is_array($row['metadata'] ?? null) ? $row['metadata'] : json_decode($row['metadata'] ?? '{}', true);
            $metadata = ActivityPolicy::metadata(\is_array($metadata) ? $metadata : []);
            if (isset($metadata['integrationId']) && !isset($this->resolvedIntegrations[$metadata['integrationId']])) {
                $integrations[] = $metadata['integrationId'];
            }
            if (isset($metadata['notificationId']) && !isset($this->resolvedNotifications[$metadata['notificationId']])) {
                $notifications[] = $metadata['notificationId'];
            }
        }
        foreach ($integrations as $id) {
            $this->resolvedIntegrations[$id] = true;
        }
        foreach ($notifications as $id) {
            $this->resolvedNotifications[$id] = true;
        }

        try {
            if ($integrations) {
                $this->integrationNames += (new Query())->select(['name' => new Expression('SUBSTRING([[name]], 1, 160)')])->from(IntegrationRecord::TABLE)->where(['id' => array_unique($integrations)])->indexBy('id')->column();
            }
        } catch (\Throwable) {
            // IDs remain useful if the optional name lookup is unavailable.
        }

        try {
            if ($notifications) {
                $name = 'pgsql' === \Craft::$app->getDb()->getDriverName()
                    ? new Expression("SUBSTRING(CAST([[metadata]] AS JSONB)->>'name', 1, 160)")
                    : new Expression("SUBSTRING(JSON_UNQUOTE(JSON_EXTRACT([[metadata]], '$.name')), 1, 160)");
                $names = (new Query())->select(['id', 'name' => $name])->from(FormNotificationRecord::TABLE)->where(['id' => array_unique($notifications)])->all();
                foreach ($names as $record) {
                    if (\is_string($record['name']) && '' !== trim($record['name'])) {
                        $this->notificationNames[(int) $record['id']] = $record['name'];
                    }
                }
            }
        } catch (\Throwable) {
            // Fetch only the display label, never recipient/template configuration into this page.
        }
    }

    private function renderSettings($settings): Response
    {
        return $this->renderTemplate('freeform/settings/activity', [
            'settings' => $settings,
            'activityEnabled' => BooleanHelper::normalize($settings->activityEnabled),
            'readOnly' => !$this->getSettingsService()->isAllowAdminEdit(),
            'catalog' => ActivityPolicy::EVENTS,
            'examples' => ActivityExamples::all(),
            'options' => ActivityPolicy::options($settings->activityMode, $settings->activityEvents),
            'customOptions' => $settings->activityEvents ? ActivityPolicy::options('custom', $settings->activityEvents) : null,
            'presets' => array_combine(ActivityPolicy::MODES, array_map(static fn ($mode) => ActivityPolicy::options($mode), ActivityPolicy::MODES)),
        ]);
    }
}
