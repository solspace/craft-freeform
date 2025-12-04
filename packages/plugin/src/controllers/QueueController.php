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

namespace Solspace\Freeform\controllers;

use craft\web\Response as CraftResponse;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Records\IntegrationRecord;

class QueueController extends BaseController
{
    protected array|bool|int $allowAnonymous = ['ping' => self::ALLOW_ANONYMOUS_LIVE];

    public function beforeAction($action): bool
    {
        \Craft::$app->getRequest()->enableCsrfValidation = false;

        return parent::beforeAction($action);
    }

    public function actionPing(): CraftResponse
    {
        $request = \Craft::$app->getRequest();
        $settings = Freeform::getInstance()->settings->getSettingsModel();

        // Verify Form Monitor authentication when managed pinger is enabled
        if ($settings->managedPingerEnabled && !$this->isValidFormMonitorRequest()) {
            return $this->asJson(['ok' => false, 'error' => 'invalid_fm_request'])->setStatusCode(401);
        }

        // Check the Freeform ping token (URL param or header)
        $token = $request->getHeaders()->get('X-Freeform-Queue-Token') ?? $request->getParam('token');
        if (!$token || $token !== $settings->queuePingToken) {
            return $this->asJson(['ok' => false, 'error' => 'unauthorized'])->setStatusCode(401);
        }

        $ttl = max(5, (int) $settings->queuePingMinIntervalSeconds);
        $lockKey = 'freeform-queue-ping-lock';
        if (Freeform::isLocked($lockKey, $ttl)) {
            return $this->asJson(['ok' => true, 'skipped' => 'rate-limited', 'minInterval' => $ttl]);
        }

        $started = microtime(true);
        $processed = false;
        $error = null;

        try {
            \Craft::$app->getQueue()->run();
            $processed = true;
        } catch (\Throwable $e) {
            try {
                \Craft::$app->runAction('queue/run');
                $processed = true;
            } catch (\Throwable $e2) {
                $error = $e2->getMessage();
            }
        }

        \Craft::$app->cache->set('freeform.queue.lastPingAt', time(), 86400);

        return $this->asJson([
            'ok' => $processed && !$error,
            'processed' => $processed,
            'durationMs' => (int) round((microtime(true) - $started) * 1000),
            'error' => $error,
        ]);
    }

    private function isValidFormMonitorRequest(): bool
    {
        $request = \Craft::$app->getRequest();

        // Verify Form Monitor service header
        if ('pinger' !== $request->getHeaders()->get('X-Form-Monitor-Service')) {
            return false;
        }

        // Get Form Monitor token from header
        $fmToken = $request->getHeaders()->get('X-Form-Monitor-Token');
        if (!$fmToken) {
            return false;
        }

        // Get Form Monitor integration and verify token
        $formMonitor = $this->getFormMonitorIntegration();
        if (!$formMonitor) {
            return false;
        }

        $requestToken = $formMonitor->getRequestToken();
        if (!$requestToken) {
            return false;
        }

        return $fmToken === $requestToken;
    }

    private function getFormMonitorIntegration(): ?FormMonitor
    {
        try {
            $record = IntegrationRecord::find()
                ->where(['class' => FormMonitor::class])
                ->one()
            ;

            if (!$record) {
                return null;
            }

            $integrationModel = Freeform::getInstance()->integrations->getById((int) $record->id);
            if (!$integrationModel) {
                return null;
            }

            $integration = $integrationModel->getIntegrationObject();

            return $integration instanceof FormMonitor ? $integration : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
