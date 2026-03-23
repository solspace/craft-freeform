<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Edition(Edition::PRO)]
#[Type(
    name: 'URL Parameter Tracking',
    type: Type::TYPE_SINGLE,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class UrlParameterTracking extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const TEMPLATE_KEY = 'url_parameters';
    public const EVENT_PREPARE_PARAMETERS = 'prepare-parameters';
    public const DEFAULT_COOKIE_TTL_MINUTES = 60 * 24 * 2; // 2 days

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'URL Tracking Parameters for this Form',
        instructions: 'Enter URL tracking parameter names you would like stored. Separate multiples on new lines.',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $parameters = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific parameters can be set inside the form builder.')]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'URL Tracking Parameters',
        instructions: 'Enter URL tracking parameter names you would like stored. Separate multiples on new lines.',
        rows: 8,
    )]
    protected array $defaultParameters = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[Input\Boolean(
        label: 'Store in cookies',
        instructions: 'Persist any of these parameters in cookies for later retrieval by Freeform.',
    )]
    #[Message('When enabled, any form using this integration can persist tracked parameters in cookies. This can be overridden per form in the form builder.')]
    protected bool $storeInCookies = false;

    #[VisibilityFilter('Boolean(enabled) && Boolean(values.storeInCookies)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[Input\Integer(
        label: 'Cookie lifetime (minutes)',
        instructions: 'Set how long Freeform should keep tracked parameters in cookies.',
        min: 1,
    )]
    #[Message('When set for this form, this value overrides the default cookie lifetime configured on the main integration.')]
    protected ?int $cookieTtlMinutes = self::DEFAULT_COOKIE_TTL_MINUTES;

    public function getCombinedParameters(): array
    {
        $parameters = array_merge($this->defaultParameters, $this->parameters);

        $parameters = array_map('trim', $parameters);
        $parameters = array_filter($parameters, static fn (string $parameter) => '' !== $parameter);

        return array_values(array_unique($parameters));
    }

    public function getParameters(): string
    {
        return $this->getProcessedValue($this->parameters);
    }

    public function getDefaultParameters(): string
    {
        return $this->getProcessedValue($this->defaultParameters);
    }

    public function isStoreInCookies(): bool
    {
        return $this->storeInCookies;
    }

    public function getCookieTtlMinutes(): int
    {
        $ttl = $this->cookieTtlMinutes ?? self::DEFAULT_COOKIE_TTL_MINUTES;

        return max(1, $ttl);
    }
}
