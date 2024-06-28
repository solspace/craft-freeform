<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\IpAddresses;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\IpUtils;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;

#[Type(
    name: 'Bloocked IP Addresses',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class BlockIpAddresses extends SpamBlockingIntegration
{
    use EnabledByDefaultTrait;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Blocked IP Addresses for this Form',
        instructions: 'Enter IP addresses you would like blocked. Separate multiples on new lines.',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $ips = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default Blocked IP Addresses',
        instructions: 'Enter IP addresses you would like blocked. Separate multiples on new lines.',
        rows: 8,
    )]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific blocks can be set inside the form builder.')]
    protected array $defaultIps = [];

    public function validate(Form $form, bool $displayErrors): void
    {
        $ips = $this->getCombinedIps();
        if (!$ips) {
            return;
        }

        $remoteIp = \Craft::$app->request->getRemoteIP();
        if (IpUtils::checkIp($remoteIp, $ips)) {
            if ($displayErrors) {
                $form->addError(Freeform::t('Your IP has been blocked'));
            } else {
                $form->markAsSpam(
                    SpamReason::TYPE_BLOCKED_IP,
                    sprintf(
                        'Form submitted by a blocked IP "%s"',
                        $remoteIp
                    )
                );
            }
        }
    }

    private function getCombinedIps(): array
    {
        return array_merge($this->ips, $this->defaultIps);
    }
}
