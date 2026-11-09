<?php

namespace Solspace\Freeform\controllers;

use craft\helpers\ProjectConfig as ProjectConfigHelper;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\SetupResources;
use Solspace\Freeform\Library\Configuration\SetupSettings;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\BadRequestHttpException;
use yii\web\ConflictHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class SetupController extends BaseController
{
    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }
        $this->requireCpRequest();
        $this->requireLogin();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        if (!$this->getSettingsService()->canUseSetupGuide()) {
            throw new ForbiddenHttpException(Freeform::t('The Setup Guide requires an administrator and an environment that allows admin changes.'));
        }
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return true;
    }

    public function actionOptions(): Response
    {
        $settings = $this->getSettingsService()->getSettingsModel();

        return $this->asJson([
            'values' => SetupSettings::values($settings),
            'locked' => SetupSettings::locked($settings, $this->overrides()),
            'canSave' => $this->getSettingsService()->isAllowAdminEdit(),
            'catalog' => $this->catalog(),
            'notificationDefaults' => ['admin' => (string) $settings->defaults->notifications->admin->template->getValue(), 'emailField' => (string) $settings->defaults->notifications->emailField->template->getValue()],
            'canCreateTemplates' => PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE)
                && !$settings->defaults->notifications->admin->template->isLocked()
                && !$settings->defaults->notifications->emailField->template->isLocked()
                && !isset($this->overrides()['defaults']['notifications']),
            'canUseAlerts' => Freeform::getInstance()->edition()->isAtLeast('lite'),
            'canUseAi' => Freeform::getInstance()->isPro(),
            'canUseAb' => Freeform::getInstance()->isPro(),
            'assetSettingsUrl' => UrlHelper::cpUrl('settings/assets'),
        ]);
    }

    public function actionSave(): Response
    {
        $this->requirePostRequest();
        if (!$this->getSettingsService()->canUseSetupGuide()) {
            throw new ForbiddenHttpException(Freeform::t('Settings cannot be changed in this environment.'));
        }
        $settings = $this->getSettingsService()->getSettingsModel();
        $request = $this->request;

        try {
            $changes = SetupSettings::changes(
                $request->getBodyParam('changes'),
                $request->getBodyParam('original'),
                SetupSettings::values($settings),
                SetupSettings::locked($settings, $this->overrides()),
            );
            $this->validateChoices($changes);
            $resourceInput = $request->getBodyParam('resources');
            $resources = $resourceInput ? SetupResources::validate($resourceInput) : [];
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException(Freeform::t($exception->getMessage()));
        } catch (\DomainException $exception) {
            throw new ForbiddenHttpException(Freeform::t($exception->getMessage()));
        } catch (\RuntimeException $exception) {
            throw new ConflictHttpException(Freeform::t($exception->getMessage()));
        }

        $hasResources = isset($resources['profile']) || isset($resources['templates']);
        if ($hasResources && isset($resources['templates'])) {
            PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);
        }
        $mutex = $hasResources ? \Craft::$app->getMutex() : null;
        if ($mutex && !$mutex->acquire('freeform-setup-resources', 5)) {
            throw new ConflictHttpException(Freeform::t('Another setup is being saved. Try again.'));
        }
        $transaction = null;
        $before = $settings->toArray();

        try {
            $receiptKey = $hasResources ? ['freeform-setup', \Craft::$app->getUser()->getId(), $resources['requestId']] : null;
            $fingerprint = hash('sha256', json_encode([$request->getBodyParam('changes'), $request->getBodyParam('original'), $resources]));
            if ($receiptKey && ($receipt = \Craft::$app->getCache()->get($receiptKey))) {
                if ($receipt !== $fingerprint) {
                    throw new \RuntimeException('This setup was already applied. Reload the guide before making more changes.');
                }

                return $this->asJson(['redirect' => UrlHelper::cpUrl('freeform/welcome')]);
            }
            if ($changes || $hasResources) {
                // Patch stored values, never copy PHP overrides or unrelated model defaults.
                $stored = ProjectConfigHelper::unpackAssociativeArrays(\Craft::$app->getProjectConfig()->get('plugins.freeform.settings') ?? []);
                $stored = SetupSettings::merge($stored, $changes);
                if ($hasResources) {
                    $transaction = \Craft::$app->getDb()->beginTransaction();
                    $stored = (new SetupResources())->create($resources, $settings, $stored, $this->overrides());
                }
                if (!\Craft::$app->getPlugins()->savePluginSettings(Freeform::getInstance(), $stored)) {
                    $errors = $settings->getErrors();
                    $transaction?->rollBack();
                    $settings->setAttributes($before, false);
                    $this->response->statusCode = 422;

                    return $this->asJson(['message' => Freeform::t('Settings could not be saved. Review the settings and try again.'), 'errors' => $errors]);
                }
                $transaction?->commit();
                if ($receiptKey) {
                    \Craft::$app->getCache()->set($receiptKey, $fingerprint, 86400);
                }
            }
        } catch (\Throwable $exception) {
            if ($transaction?->getIsActive()) {
                $transaction->rollBack();
            }
            $settings->setAttributes($before, false);
            if ($exception instanceof \DomainException) {
                throw new ForbiddenHttpException(Freeform::t($exception->getMessage()));
            }
            if ($exception instanceof \InvalidArgumentException) {
                throw new BadRequestHttpException(Freeform::t($exception->getMessage()));
            }
            if ($exception instanceof \RuntimeException) {
                throw new ConflictHttpException(Freeform::t($exception->getMessage()));
            }

            throw $exception;
        } finally {
            $mutex?->release('freeform-setup-resources');
        }
        \Craft::$app->getSession()->setNotice(Freeform::t('Freeform defaults saved.'));

        // Reload the app so builder configuration and caches use the saved defaults.
        return $this->asJson(['redirect' => UrlHelper::cpUrl('freeform/welcome')]);
    }

    private function catalog(): array
    {
        $service = $this->getSettingsService();
        $templates = array_merge($service->getSettingsModel()->defaults->includeSampleTemplates ? $service->getSolspaceFormTemplates() : [], $service->getCustomFormTemplates());
        $volumes = \Craft::$container->get(UploadVolumePolicy::class)->getViewableVolumes();
        $ai = Freeform::getInstance()->isPro() && PermissionHelper::checkPermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS)
            ? $this->getIntegrationsService()->getEnabledAiIntegrationOptions() : [];

        return [
            'defaultFormattingTemplate' => array_values(array_map(static fn ($template) => ['value' => $template->getFileName(), 'label' => $template->getName()], $templates)),
            'defaultUploadSource' => array_map(static fn ($volume) => ['value' => (string) $volume->id, 'label' => $volume->name], $volumes),
            'defaultAiIntegration' => array_map(static fn ($integration) => ['value' => $integration['uid'], 'label' => $integration['name']], $ai),
        ];
    }

    private function validateChoices(array $changes): void
    {
        if (isset($changes['abTests']) && !Freeform::getInstance()->isPro()) {
            throw new \InvalidArgumentException('A/B Testing requires Freeform Pro.');
        }
        $dynamic = array_intersect_key($changes, array_flip(['defaultFormattingTemplate', 'defaultUploadSource', 'defaultAiIntegration']));
        if ($dynamic) {
            $catalog = $this->catalog();
            foreach ($dynamic as $key => $value) {
                if ('' !== $value && !\in_array($value, array_column($catalog[$key], 'value'), true)) {
                    throw new \InvalidArgumentException('This setup option is no longer available. Reload the guide.');
                }
            }
        }
        if (array_intersect_key($changes, array_flip(['alertNotificationRecipients', 'errorNotificationRecipients', 'clientDigestRecipients', 'clientDigestFrequency'])) && !Freeform::getInstance()->edition()->isAtLeast('lite')) {
            throw new \InvalidArgumentException('Email alerts and digests require Freeform Lite or Pro.');
        }
    }

    private function overrides(): array
    {
        $file = \Craft::$app->getConfig()->getConfigFromFile('freeform');
        $plugins = \Craft::$app->getPlugins()->pluginConfigs ?? [];

        return array_replace($file, $plugins['freeform']['settings'] ?? []);
    }
}
