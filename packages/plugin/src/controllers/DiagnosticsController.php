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
use Solspace\Freeform\Resources\Bundles\DiagnosticsBundle;
use yii\web\Response;

class DiagnosticsController extends BaseController
{
    public function actionIndex(): Response
    {
        \Craft::$app->view->registerAssetBundle(DiagnosticsBundle::class);

        $diagnostics = Freeform::getInstance()->diagnostics;

        $server = $diagnostics->getServerChecks();
        $site = $diagnostics->getSiteChecks();
        $stats = $diagnostics->getFreeformStats();
        $configurations = $diagnostics->getFreeformConfigurations();
        $integrations = $diagnostics->getFreeformIntegrations();
        $formType = $diagnostics->getFreeformFormType();
        $modules = $diagnostics->getCraftModules();

        $combined = array_merge($server, $site, $stats, $configurations, $integrations, $formType, $modules);
        [$warnings, $suggestions] = $this->compileBanners($combined);

        $report = $this->compileReport([
            Freeform::t('Server Checks') => $server,
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
