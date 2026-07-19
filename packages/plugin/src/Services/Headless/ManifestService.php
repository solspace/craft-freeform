<?php

namespace Solspace\Freeform\Services\Headless;

use craft\elements\User;
use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\Headless\Manifest\FormSecuritySerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestConditionalSerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestExtensionResolver;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestLayoutSerializer;
use Solspace\Freeform\Services\Headless\Profile\ContextProviderInterface;
use Solspace\Freeform\Services\Headless\Profile\HeadlessProfile;

class ManifestService
{
    public function __construct(
        private ManifestLayoutSerializer $layoutSerializer,
        private ManifestFieldSerializer $fieldSerializer,
        private ManifestConditionalSerializer $conditionalSerializer,
        private ManifestExtensionResolver $extensionResolver,
        private FormSecuritySerializer $securitySerializer,
        private RuleProvider $ruleProvider,
    ) {}

    public function buildPublicManifest(Form $form): array
    {
        return $this->buildBaseManifest($form, [
            'mode' => 'public',
            'submitUrl' => \sprintf('/freeform/api/forms/%s/submit', $form->getHandle()),
            'manifestUrl' => \sprintf('/freeform/api/forms/%s/manifest', $form->getHandle()),
        ]);
    }

    /**
     * @param array<string, mixed> $properties
     */
    public function buildProfileManifest(
        Form $form,
        HeadlessProfile $profile,
        array $properties,
        ?ContextProviderInterface $provider,
    ): array {
        $manifest = $this->buildBaseManifest($form, [
            'mode' => 'profile',
            'profile' => $profile->name,
            'submitUrl' => \sprintf('/freeform/api/manifests/%s/submit', $profile->name),
            'manifestUrl' => \sprintf('/freeform/api/manifests/%s/manifest', $profile->name),
            'properties' => $properties,
        ]);

        if ($provider) {
            $manifest['context'] = [
                'defaultValues' => $provider->getDefaultValues($form, $properties, $this->currentUser()),
                'hiddenFields' => $provider->getHiddenFieldHandles($form, $properties, $this->currentUser()),
                'lockedFields' => $provider->getLockedFieldHandles($form, $properties, $this->currentUser()),
            ];
        }

        $manifest['cache'] = [
            'visibility' => str_contains($profile->cache, 'no-store') ? 'private' : 'public',
            'maxAge' => str_contains($profile->cache, 'no-store') ? 0 : 300,
        ];

        return $manifest;
    }

    /**
     * @param array<string, mixed> $endpointMeta
     *
     * @return array<string, mixed>
     */
    private function buildBaseManifest(Form $form, array $endpointMeta): array
    {
        $csrfRequired = \Craft::$app->getRequest()->enableCsrfValidation;
        $fieldsByHandle = $this->layoutSerializer->collectFieldHandles($form);
        $serializedFields = $this->fieldSerializer->serialize($form, $fieldsByHandle);
        $behavior = $form->getSettings()->getBehavior();

        return [
            'schemaVersion' => '1.0',
            'pluginVersion' => Freeform::getInstance()->version,
            // npm packages use an independent semver line (e.g. 0.1.0-beta.x), not the plugin version.
            'minimumClientVersion' => '0.1.0',
            'generatedAt' => (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format(\DateTimeInterface::ATOM),
            'site' => [
                'id' => \Craft::$app->getSites()->getCurrentSite()->id,
                'handle' => \Craft::$app->getSites()->getCurrentSite()->handle,
                'language' => \Craft::$app->language,
                'baseUrl' => \Craft::$app->getSites()->getCurrentSite()->getBaseUrl(),
            ],
            'form' => [
                'id' => $form->getId(),
                'uid' => $form->getUid(),
                'handle' => $form->getHandle(),
                'name' => $form->getName(),
                'type' => $form->getType(),
                'multiPage' => $form->isMultiPage(),
            ],
            'endpoints' => [
                'manifest' => [
                    'method' => 'GET',
                    'url' => $endpointMeta['manifestUrl'],
                ],
                'submit' => [
                    'method' => 'POST',
                    'url' => $endpointMeta['submitUrl'],
                    'encodings' => ['application/json', 'multipart/form-data'],
                    'defaultEncoding' => 'multipart/form-data',
                ],
                'csrf' => [
                    'method' => 'GET',
                    'url' => '/freeform/tokens',
                    'required' => $csrfRequired,
                ],
            ],
            'settings' => [
                'multiPage' => $form->isMultiPage(),
                'ajax' => true,
                'mode' => $endpointMeta['mode'],
                'successBehavior' => $behavior->successBehavior,
                'successMessage' => $behavior->getSuccessMessage(),
            ],
            'layout' => $this->layoutSerializer->serialize($form),
            'fields' => (object) $serializedFields,
            'conditionals' => $this->conditionalSerializer->serialize($form, $this->ruleProvider),
            'security' => $this->securitySerializer->serialize($form, $csrfRequired),
            'cache' => [
                'visibility' => 'profile' === ($endpointMeta['mode'] ?? 'public') ? 'private' : 'public',
                'maxAge' => 'profile' === ($endpointMeta['mode'] ?? 'public') ? 0 : 300,
            ],
            'requiredExtensions' => $this->extensionResolver->resolveRequiredExtensions($serializedFields),
            'metadata' => array_filter([
                'profile' => $endpointMeta['profile'] ?? null,
                'properties' => $endpointMeta['properties'] ?? null,
            ]),
        ];
    }

    private function currentUser(): ?User
    {
        $identity = \Craft::$app->getUser()->getIdentity();

        return $identity instanceof User ? $identity : null;
    }
}
