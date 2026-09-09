<?php

namespace Solspace\Freeform\Services\Headless\Profile;

use craft\elements\User;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\UnauthorizedHttpException;

/**
 * Access checks for named headless manifest profiles (Phase 1.9.6).
 */
class ProfileAccessService
{
    /** @var string[] */
    private const UNSAFE_TOP_LEVEL_KEYS = [
        'elementId',
        'submissionId',
        'userId',
        'id',
        'uid',
    ];

    public function __construct(
        private HeadlessProfileRegistry $registry,
        private ProfilePropertyExtractor $propertyExtractor,
    ) {}

    public function getProfile(string $profileName): HeadlessProfile
    {
        $profile = $this->registry->get($profileName);
        if (!$profile) {
            throw new BadRequestHttpException(\sprintf('Unknown manifest profile "%s".', $profileName));
        }

        return $profile;
    }

    /**
     * @return array{profile: HeadlessProfile, properties: array<string, mixed>, provider: ?ContextProviderInterface}
     */
    public function authorizeManifest(string $profileName): array
    {
        $profile = $this->getProfile($profileName);
        $this->rejectUnsafeRequestParameters();
        $properties = $this->propertyExtractor->extract($profile->properties);
        $user = $this->resolveUser($profile);
        $provider = $this->resolveProvider($profile);

        if ($profile->requiresAuth && !$user) {
            throw new UnauthorizedHttpException('Authentication is required for this profile.');
        }

        if ($provider && !$provider->canAccessManifest($this->resolveForm($profile), $properties, $user)) {
            throw new ForbiddenHttpException('You are not permitted to access this manifest.');
        }

        return [
            'profile' => $profile,
            'properties' => $properties,
            'provider' => $provider,
        ];
    }

    /**
     * @return array{profile: HeadlessProfile, properties: array<string, mixed>, provider: ?ContextProviderInterface}
     */
    public function authorizeSubmit(string $profileName): array
    {
        $context = $this->authorizeManifest($profileName);
        $profile = $context['profile'];

        if (!$profile->allowSubmit) {
            throw new ForbiddenHttpException('Submit is not allowed for this profile.');
        }

        $provider = $context['provider'];
        $user = $this->resolveUser($profile);

        if ($provider && !$provider->canSubmit($this->resolveForm($profile), $context['properties'], $user)) {
            throw new ForbiddenHttpException('You are not permitted to submit through this profile.');
        }

        return $context;
    }

    public function rejectUnsafeRequestParameters(): void
    {
        $request = \Craft::$app->getRequest();

        foreach (self::UNSAFE_TOP_LEVEL_KEYS as $key) {
            if (null !== $request->getQueryParam($key) || null !== $request->getBodyParam($key)) {
                throw new BadRequestHttpException(\sprintf(
                    'Raw identifier "%s" is not accepted. Use an explicit profile with allow-listed properties.',
                    $key
                ));
            }
        }
    }

    private function resolveUser(HeadlessProfile $profile): ?User
    {
        $identity = \Craft::$app->getUser()->getIdentity();

        return $identity instanceof User ? $identity : null;
    }

    private function resolveProvider(HeadlessProfile $profile): ?ContextProviderInterface
    {
        $class = $profile->contextProviderClass;
        if (!$class) {
            return null;
        }

        if (!class_exists($class)) {
            throw new BadRequestHttpException(\sprintf('Context provider "%s" is not available.', $class));
        }

        $instance = \Craft::$container->get($class);
        if (!$instance instanceof ContextProviderInterface) {
            throw new BadRequestHttpException(\sprintf('Context provider "%s" must implement ContextProviderInterface.', $class));
        }

        return $instance;
    }

    private function resolveForm(HeadlessProfile $profile): Form
    {
        $form = Freeform::getInstance()->forms->getFormByHandle($profile->formHandle);
        if (!$form) {
            throw new BadRequestHttpException(\sprintf('Form "%s" is not available for profile "%s".', $profile->formHandle, $profile->name));
        }

        return $form;
    }
}
