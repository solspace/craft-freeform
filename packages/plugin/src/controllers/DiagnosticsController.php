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
use Solspace\Freeform\Library\Database\OrphanedSubmissionScanner;
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

        $combined = array_merge($server, $database, $stats, $configurations);
        [$warnings, $suggestions] = $this->compileBanners($combined);

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
