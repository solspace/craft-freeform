<?php

namespace Solspace\Freeform\Services\Headless;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\ComparisonHelper;
use Solspace\Freeform\Services\Headless\Profile\HeadlessProfileRegistry;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

/**
 * Global and per-form headless access checks (config-driven for alpha).
 */
class HeadlessAccessService
{
    public function isEnabled(): bool
    {
        $config = \Craft::$app->config->getConfigFromFile('freeform');

        return (bool) ($config['headless']['enabled'] ?? false);
    }

    /**
     * @return string[]
     */
    public function getGlobalAllowedOrigins(): array
    {
        $config = \Craft::$app->config->getConfigFromFile('freeform');
        $origins = $config['headless']['allowedOrigins'] ?? [];

        return \is_array($origins) ? $origins : [];
    }

    public function requireEnabled(): void
    {
        if (!$this->isEnabled()) {
            throw new NotFoundHttpException('Headless API is not enabled.');
        }
    }

    public function canExposeManifest(Form $form): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $config = $this->getFormHeadlessConfig($form);

        return (bool) ($config['exposeManifest'] ?? false);
    }

    public function canSubmit(Form $form): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $config = $this->getFormHeadlessConfig($form);

        return (bool) ($config['allowSubmit'] ?? false);
    }

    public function requireManifestAccess(Form $form): void
    {
        $this->requireEnabled();

        if (!$this->canExposeManifest($form)) {
            throw new ForbiddenHttpException('Manifest access is not enabled for this form.');
        }
    }

    public function requireSubmitAccess(Form $form): void
    {
        $this->requireEnabled();

        if (!$this->canSubmit($form)) {
            throw new ForbiddenHttpException('Submit access is not enabled for this form.');
        }
    }

    /**
     * @return string[]
     */
    public function getEffectiveOrigins(Form $form): array
    {
        $formConfig = $this->getFormHeadlessConfig($form);
        $formOrigins = $formConfig['allowedOrigins'] ?? [];

        if (!\is_array($formOrigins)) {
            $formOrigins = [];
        }

        return array_values(array_unique(array_merge($this->getGlobalAllowedOrigins(), $formOrigins)));
    }

    /**
     * Merges global, per-form, and per-profile origins for CORS.
     *
     * @return string[]
     */
    public function resolveCorsOrigins(?string $formHandle = null, ?string $profileName = null): array
    {
        $origins = [];

        if ($formHandle) {
            $form = Freeform::getInstance()->forms->getFormByHandle($formHandle);
            if ($form) {
                $origins = $this->getEffectiveOrigins($form);
            }
        }

        if ($profileName) {
            $profile = \Craft::$container->get(HeadlessProfileRegistry::class)->get($profileName);
            if ($profile) {
                if ([] === $origins && '' !== $profile->formHandle) {
                    $form = Freeform::getInstance()->forms->getFormByHandle($profile->formHandle);
                    if ($form) {
                        $origins = $this->getEffectiveOrigins($form);
                    }
                }

                $origins = array_merge($origins, $profile->allowedOrigins);
            }
        }

        if ([] === $origins) {
            $origins = $this->getGlobalAllowedOrigins();
        }

        if ([] === $origins) {
            $general = \Craft::$app->getConfig()->getGeneral()->allowedGraphqlOrigins;
            $origins = '*' === $general ? ['*'] : (\is_array($general) ? $general : [$general]);
        }

        return $this->normalizeOriginsForRequest(array_values(array_unique($origins)));
    }

    /**
     * Expands wildcard origin patterns to include the current request Origin when it matches.
     *
     * @param string[] $origins
     *
     * @return string[]
     */
    private function normalizeOriginsForRequest(array $origins): array
    {
        $requestOrigin = \Craft::$app->getRequest()->getHeaders()->get('Origin');
        if (!$requestOrigin) {
            return $origins;
        }

        $normalized = [];
        foreach ($origins as $origin) {
            $normalized[] = $origin;

            if (str_contains($origin, '*') && ComparisonHelper::stringMatchesWildcard($origin, $requestOrigin)) {
                $normalized[] = $requestOrigin;
            }
        }

        return array_values(array_unique($normalized));
    }

    /**
     * @return array<string, mixed>
     */
    private function getFormHeadlessConfig(Form $form): array
    {
        $config = \Craft::$app->config->getConfigFromFile('freeform');
        $forms = $config['headless']['forms'] ?? [];

        if (!\is_array($forms)) {
            return [];
        }

        $handle = $form->getHandle();

        return \is_array($forms[$handle] ?? null) ? $forms[$handle] : [];
    }
}
