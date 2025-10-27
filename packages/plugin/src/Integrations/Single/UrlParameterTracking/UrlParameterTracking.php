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

#[Edition(Edition::PRO)]
#[Type(
    name: 'URL Parameter Tracking',
    type: Type::TYPE_SINGLE,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class UrlParameterTracking extends BaseIntegration
{
    use EnabledByDefaultTrait;

    public const TEMPLATE_KEY = 'url_parameters';

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

    public function getCombinedParameters(): array
    {
        $parameters = array_merge($this->defaultParameters, $this->parameters);

        return array_unique($parameters);
    }

    public function getParameters(): string
    {
        return $this->getProcessedValue($this->parameters);
    }

    public function getDefaultParameters(): string
    {
        return $this->getProcessedValue($this->defaultParameters);
    }
}
