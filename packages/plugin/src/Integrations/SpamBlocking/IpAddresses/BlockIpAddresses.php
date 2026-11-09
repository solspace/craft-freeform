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
    #[Input\Boolean(label: 'Advanced settings', instructions: 'Optional DNS block list checks.', order: 90)]
    protected bool $showAdvanced = false;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 11,
        label: 'Blocked IP Addresses for this Form',
        instructions: 'One IP address or CIDR range per line, such as `192.0.2.10` or `192.0.2.0/24`.',
        rows: 8,
    )]
    #[Message('Added to the default block list for this form only.')]
    protected array $ips = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 10,
        label: 'Default Blocked IP Addresses',
        instructions: 'One IP address or CIDR range per line, such as `192.0.2.10` or `192.0.2.0/24`.',
        rows: 8,
    )]
    #[Message('Used by every form with this integration. Add form-specific entries in the form builder.')]
    protected array $defaultIps = [];

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        order: 100,
        label: 'Check DNS Block Lists',
        instructions: 'Check the visitor’s IP against the DNS block lists below, in addition to your own blocked IP addresses.',
    )]
    protected string $checkDnsBlockLists = 'false';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 111,
        label: 'DNS Block Lists',
        instructions: 'One DNS block list hostname per line, such as `zen.spamhaus.org`.',
        rows: 8,
    )]
    #[Message('Added to the default block list for this form only.')]
    protected array $dnsBlockLists = [];

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 110,
        label: 'Default DNS Block Lists',
        instructions: 'One DNS block list hostname per line, such as `zen.spamhaus.org`.',
        rows: 8,
    )]
    #[Message('Used by every form with this integration. Add form-specific entries in the form builder.')]
    protected array $defaultDnsBlockLists = ['zen.spamhaus.org', 'bl.spamcop.net'];

    public function isCheckDnsBlockLists(): bool
    {
        return $this->getProcessedBoolean($this->checkDnsBlockLists);
    }

    public function validate(Form $form, bool $displayErrors): void
    {
        $remoteIp = \Craft::$app->request->getUserIP();
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

        if ($this->isCheckDnsBlockLists() && IpUtils::checkDnsBlockLists($remoteIp, $dnsBlockLists)) {
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
