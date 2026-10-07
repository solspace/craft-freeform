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

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\IntegrityScan;
use Solspace\Freeform\Library\Database\OrphanedSubmissionScanner;
use Solspace\Freeform\Library\Diagnostics\NotificationReadinessScan;
use Solspace\Freeform\Library\Diagnostics\UploadIntegrityScan;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Resources\Bundles\DiagnosticsBundle;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class DiagnosticsController extends BaseController
{
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        \Craft::$app->view->registerAssetBundle(DiagnosticsBundle::class);

        $diagnostics = Freeform::getInstance()->diagnostics;

        $server = $diagnostics->getServerChecks();
        $database = $diagnostics->getDatabaseChecks();
        $site = $diagnostics->getSiteChecks();
        $stats = $diagnostics->getFreeformStats();
        $configurations = $diagnostics->getFreeformConfigurations();
        $integrations = $diagnostics->getFreeformIntegrations();
        $formType = $diagnostics->getFreeformFormType();
        $modules = $diagnostics->getCraftModules();

        $combined = array_merge($server, $database, $site, $stats, $configurations, $integrations, $formType, $modules);
        [$warnings, $suggestions] = $this->compileBanners($combined);

        $report = $this->compileReport([
            Freeform::t('Server Checks') => $server,
            Freeform::t('Database Checks') => $database,
            Freeform::t('Site Settings') => $site,
            ...$configurations,
            Freeform::t('Statistics') => $stats,
            Freeform::t('Integrations') => $integrations,
            Freeform::t('Form Types') => $formType,
            Freeform::t('Modules') => $modules,
        ]);

        return $this->renderTemplate(
            'freeform/settings/_diagnostics',
            [
                'server' => $server,
                'database' => $database,
                'site' => $site,
                'stats' => $stats,
                'configurations' => $configurations,
                'integrations' => $integrations,
                'formType' => $formType,
                'modules' => $modules,
                'warnings' => $warnings,
                'suggestions' => $suggestions,
                'report' => $report,
                'readOnly' => false,
            ]
        );
    }

    public function actionScanOrphanedSubmissions(): Response
    {
        $this->requirePostRequest();
        $this->requireCpRequest();
        $this->requireAcceptsJson();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $request = \Craft::$app->getRequest();
        $cursor = filter_var($request->getBodyParam('cursor', 0), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        $maxId = $request->getBodyParam('maxId');
        if (null !== $maxId) {
            $maxId = filter_var($maxId, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        }

        if (false === $cursor || false === $maxId) {
            throw new BadRequestHttpException('Invalid scan cursor.');
        }

        try {
            return $this->asJson((new OrphanedSubmissionScanner(\Craft::$app->getDb()))->scan($cursor, $maxId));
        } catch (\Throwable $exception) {
            \Craft::warning('Unable to scan orphaned Freeform submissions: '.$exception->getMessage(), 'freeform');

            return $this->asFailure(Freeform::t('The scan could not be completed. Check the Craft logs or ask your developer to investigate.'));
        }
    }

    public function actionScanRelatedData(): Response
    {
        $this->requirePostRequest();
        $this->requireCpRequest();
        $this->requireAcceptsJson();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $request = \Craft::$app->getRequest();
        $scanId = $request->getBodyParam('scanId');
        if (null !== $scanId && (!\is_string($scanId) || !preg_match('/^[a-f0-9]{32}$/D', $scanId))) {
            throw new BadRequestHttpException('Invalid scan ID.');
        }
        $cache = \Craft::$app->getCache();
        $owner = (string) \Craft::$app->getUser()->getId();
        $scan = new IntegrityScan(\Craft::$app->getDb());

        try {
            if (null === $scanId) {
                $scanId = bin2hex(random_bytes(16));
                $state = ['tasks' => $scan->getTasks(), 'task' => 0, 'cursor' => 0, 'maxId' => null, 'affected' => 0, 'scanned' => 0, 'results' => []];
            } else {
                $state = $cache->get(['freeform-integrity-scan', $owner, $scanId]);
                if (false === $state) {
                    return $this->asFailure(Freeform::t('The scan expired. Start a new scan.'));
                }
            }

            $task = $state['tasks'][$state['task']] ?? null;
            if ($task) {
                $result = $scan->scanTask($task, $state['cursor'], $state['maxId']);
                $state['cursor'] = $result['cursor'];
                $state['maxId'] = $result['maxId'];
                $state['scanned'] += $result['scanned'];
                $state['affected'] += $result['affected'];
                if ($result['complete']) {
                    $state['results'][] = [
                        'table' => \Craft::$app->getDb()->getSchema()->getRawTableName($task['table']),
                        'columns' => $task['columns'] ?? [],
                        'type' => $task['type'],
                        'count' => $state['affected'],
                        'error' => $result['error'],
                    ];
                    ++$state['task'];
                    $state['cursor'] = $state['affected'] = 0;
                    $state['maxId'] = null;
                }
            }
            $complete = $state['task'] >= \count($state['tasks']);
            if (!$cache->set(['freeform-integrity-scan', $owner, $scanId], $state, 3600)) {
                return $this->asFailure(Freeform::t('The scan progress could not be saved. Check the Craft cache configuration.'));
            }

            return $this->asJson([
                'scanId' => $scanId,
                'complete' => $complete,
                'completedChecks' => $state['task'],
                'totalChecks' => \count($state['tasks']),
                'scanned' => $state['scanned'],
                'results' => array_values(array_map(
                    static fn ($result) => array_replace($result, ['error' => $result['error'] ? Freeform::t($result['error']) : null]),
                    array_filter($state['results'], static fn ($result) => $result['count'] || $result['error'])
                )),
            ]);
        } catch (\Throwable $exception) {
            \Craft::warning('Unable to scan Freeform related data: '.$exception->getMessage(), 'freeform');

            return $this->asFailure(Freeform::t('The scan could not be completed. Check the Craft logs or ask your developer to investigate.'));
        }
    }

    public function actionScanUploadedFiles(): Response
    {
        return $this->scanReadiness('uploads');
    }

    public function actionScanNotifications(): Response
    {
        return $this->scanReadiness('notifications');
    }

    public function actionCraftPreflight(): Response
    {
        \Craft::$app->view->registerAssetBundle(DiagnosticsBundle::class);

        $preflight = Freeform::getInstance()->preflight;

        [$warnings, $suggestions] = $this->compileBanners($preflight->getItems());

        return $this->renderTemplate(
            'freeform/settings/_craft-preflight',
            [
                'warnings' => $warnings,
                'suggestions' => $suggestions,
                'readOnly' => false,
            ]
        );
    }

    private function scanReadiness(string $kind): Response
    {
        $this->requirePostRequest();
        $this->requireCpRequest();
        $this->requireAcceptsJson();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $scanId = \Craft::$app->getRequest()->getBodyParam('scanId');
        if (null !== $scanId && (!\is_string($scanId) || !preg_match('/^[a-f0-9]{32}$/D', $scanId))) {
            throw new BadRequestHttpException('Invalid scan ID.');
        }
        $cache = \Craft::$app->getCache();
        $owner = (string) \Craft::$app->getUser()->getId();
        $scan = $kind === 'uploads' ? new UploadIntegrityScan(\Craft::$app->getDb()) : new NotificationReadinessScan(\Craft::$app->getDb());

        try {
            if (null === $scanId) {
                $scanId = bin2hex(random_bytes(16));
                $state = ['tasks' => $scan->getTasks(), 'task' => 0, 'cursor' => 0, 'maxId' => null, 'offset' => 0, 'scanned' => 0, 'issues' => 0, 'skipped' => 0, 'results' => []];
            } else {
                $state = $cache->get(['freeform-readiness-scan', $owner, $kind, $scanId]);
                if (false === $state) {
                    return $this->asFailure(Freeform::t('The scan expired. Start a new scan.'));
                }
            }

            $task = $state['tasks'][$state['task']] ?? null;
            if ($task) {
                $batch = $scan->scanTask($task, $state['cursor'], $state['maxId'], $state['offset']);
                $state['scanned'] += $batch['scanned'];
                foreach ($batch['results'] as $issue) {
                    ++$state[$issue['skipped'] ? 'skipped' : 'issues'];
                    if (\count($state['results']) < 100) {
                        $state['results'][] = $issue;
                    }
                }
                $state['cursor'] = $batch['cursor'];
                $state['maxId'] = $batch['maxId'];
                $state['offset'] = $batch['offset'];
                if ($batch['complete']) {
                    ++$state['task'];
                    $state['cursor'] = $state['offset'] = 0;
                    $state['maxId'] = null;
                }
            }
            if (!$cache->set(['freeform-readiness-scan', $owner, $kind, $scanId], $state, 3600)) {
                return $this->asFailure(Freeform::t('The scan progress could not be saved. Check the Craft cache configuration.'));
            }

            return $this->asJson([
                'scanId' => $scanId,
                'complete' => $state['task'] >= \count($state['tasks']),
                'completedChecks' => $state['task'],
                'totalChecks' => \count($state['tasks']),
                'scanned' => $state['scanned'],
                'issues' => $state['issues'],
                'skipped' => $state['skipped'],
                'truncated' => $state['issues'] + $state['skipped'] > \count($state['results']),
                'results' => array_map(static function (array $issue) use ($kind): array {
                    $context = $issue['context'];
                    $message = $kind === 'notifications'
                        ? 'Form “{form}”, notification {notification}: {message}'
                        : (isset($context['submission']) ? 'Form “{form}”, field “{field}”, submission {submission}: {message}' : 'Form “{form}”, field “{field}”: {message}');

                    return ['message' => Freeform::t($message, $context + ['message' => Freeform::t($issue['message'])]), 'skipped' => $issue['skipped']];
                }, $state['results']),
            ]);
        } catch (\Throwable $exception) {
            \Craft::warning('Unable to scan Freeform '.$kind.': '.$exception->getMessage(), 'freeform');

            return $this->asFailure(Freeform::t('The scan could not be completed. Check the Craft logs or ask your developer to investigate.'));
        }
    }

    private function compileReport(array $sections): string
    {
        $lines = [
            Freeform::t('Freeform Diagnostics'),
            Freeform::t('Generated at {timestamp}', ['timestamp' => gmdate('Y-m-d H:i:s').' UTC']),
        ];

        foreach ($sections as $heading => $items) {
            if (!$items) {
                continue;
            }

            $lines[] = '';
            $lines[] = $heading;
            $lines = array_merge($lines, $this->compileReportItems($items));
        }

        return implode("\n", $lines);
    }

    private function compileReportItems(array $items): array
    {
        $lines = [];
        foreach ($items as $heading => $item) {
            if (\is_array($item)) {
                $lines[] = $heading;
                $lines = array_merge($lines, $this->compileReportItems($item));

                continue;
            }

            $markup = (string) $item->getMarkup();
            if ($markup === '') {
                continue;
            }

            $status = null;
            if ($item->getWarnings()) {
                $status = 'Potential issue';
            } elseif ($item->getSuggestions()) {
                $status = 'Advisory';
            } elseif (preg_match('/\bdiag-(enabled|disabled|warning|info)\b/', $markup, $matches)) {
                $status = match ($matches[1]) {
                    'enabled' => 'Enabled / Valid',
                    'disabled' => 'Disabled',
                    'warning' => 'Potential issue',
                    'info' => 'Advisory',
                };
            }

            $lines[] = $this->reportText($markup).($status ? ' ['.Freeform::t($status).']' : '');
            foreach ($item->getAllValidators() as $validator) {
                $lines[] = '  - '.$this->reportText((string) $validator->getMessage());
            }
        }

        return $lines;
    }

    private function reportText(string $markup): string
    {
        return trim(html_entity_decode(strip_tags($markup), \ENT_QUOTES | \ENT_HTML5, 'UTF-8'));
    }

    private function compileBanners($items): array
    {
        $warnings = $suggestions = [];
        foreach ($items as $item) {
            if (\is_array($item)) {
                [$subWarnings, $subSuggestions] = $this->compileBanners($item);
                $warnings = array_merge($warnings, $subWarnings);
                $suggestions = array_merge($suggestions, $subSuggestions);

                continue;
            }

            if ($item->getWarnings()) {
                $warnings = array_merge($warnings, $item->getWarnings());
            }

            if ($item->getSuggestions()) {
                $suggestions = array_merge($suggestions, $item->getSuggestions());
            }
        }

        return [$warnings, $suggestions];
    }
}
