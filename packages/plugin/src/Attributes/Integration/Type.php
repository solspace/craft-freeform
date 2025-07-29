<?php

namespace Solspace\Freeform\Attributes\Integration;

use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Serializer\Attribute\Groups;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public const TYPE_CAPTCHAS = 'captchas';
    public const TYPE_CRM = 'crm';
    public const TYPE_EMAIL_MARKETING = 'email-marketing';
    public const TYPE_ELEMENTS = 'elements';
    public const TYPE_PAYMENT_GATEWAYS = 'payment-gateways';
    public const TYPE_WEBHOOKS = 'webhooks';
    public const TYPE_SINGLE = 'single';
    public const TYPE_SPAM_BLOCK = 'spam-blocking';
    public const TYPE_OTHER = 'other';

    public array $editions = [];
    public string $class;
    public string $shortName;
    public ?PropertyCollection $properties;

    public function __construct(
        public string $name,
        public string $type,
        public ?string $version = null,
        #[Ignore]
        public ?string $readme = null,
        #[Ignore]
        public ?string $iconPath = null,
    ) {}

    public function __toString(): string
    {
        return $this->name;
    }

    public function getNameWithVersion(): string
    {
        return trim($this->name.' '.$this->version);
    }

    public function getReadmeContent(): ?string
    {
        if ($this->readme && file_exists($this->readme)) {
            return file_get_contents($this->readme);
        }

        return null;
    }

    public function editionCheck(string $edition): bool
    {
        if (empty($this->editions)) {
            return true;
        }

        return \in_array($edition, $this->editions, true);
    }

    public function implements(string $interface): bool
    {
        return (new \ReflectionClass($this->class))->implementsInterface($interface);
    }

    #[Ignore]
    public function getIconUrl(): ?string
    {
        if ($this->iconPath && file_exists($this->iconPath)) {
            return \Craft::$app->assetManager->getPublishedUrl($this->iconPath, true);
        }

        return null;
    }

    #[Groups(['integration-edit'])]
    public function getIconSvg(): ?string
    {
        if ($this->iconPath && file_exists($this->iconPath)) {
            if (str_ends_with($this->iconPath, '.svg')) {
                return file_get_contents($this->iconPath);
            }

            return null;
        }

        return null;
    }
}
