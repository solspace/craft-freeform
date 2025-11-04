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
    name: 'Blocked IP Addresses',
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

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        label: 'Check DNS Block Lists',
        instructions: 'IP addresses will be checked against the DNS block lists provided below to help detect spam and abusive activity.',
    )]
    protected string $checkDnsBlockLists = 'false';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.checkDnsBlockLists)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'DNS Block Lists',
        instructions: "Enter the DNS block lists you'd like to use. Add one per line.",
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $dnsBlockLists = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.checkDnsBlockLists)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default DNS Block Lists',
        instructions: "Enter the DNS block lists you'd like to use. Add one per line.",
        rows: 8,
    )]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific blocks can be set inside the form builder.')]
    protected array $defaultDnsBlockLists = ['zen.spamhaus.org', 'bl.spamcop.net'];

    public function validate(Form $form, bool $displayErrors): void
    {
        $remoteIp = \Craft::$app->request->getRemoteIP();
        $dnsBlockLists = $this->getCombinedDnsBlockLists();
        $ips = $this->getCombinedIps();

        if ($ips && IpUtils::checkIp($remoteIp, $ips)) {
            $form->markAsSpam(
                SpamReason::TYPE_BLOCKED_IP,
                \sprintf(
                    'Form submitted by a blocked IP "%s"',
                    $remoteIp
                )
            );

            if ($displayErrors) {
                $form->addError(Freeform::t('Your IP has been blocked'));
            }
        }

        if ($this->checkDnsBlockLists && IpUtils::checkDnsBlockLists($remoteIp, $dnsBlockLists)) {
            $form->markAsSpam(
                SpamReason::TYPE_BLOCKED_IP,
                \sprintf(
                    'IP "%s" was listed on DNS block lists',
                    $remoteIp
                )
            );

            if ($displayErrors) {
                $form->addError(Freeform::t('Your IP has been blocked'));
            }
        }
    }

    private function getCombinedIps(): array
    {
        return array_merge($this->ips, $this->defaultIps);
    }

    private function getCombinedDnsBlockLists(): array
    {
        return array_values(array_unique(array_filter(array_map('trim', array_merge($this->defaultDnsBlockLists, $this->dnsBlockLists)), static fn ($value) => \is_string($value) && '' !== $value)));
    }
}
