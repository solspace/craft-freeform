<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations;

use craft\helpers\App;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Delimiter;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Library\Integrations\Transformers\IntegrationRuleTransformer;
use Solspace\Freeform\Library\Rules\Types\IntegrationRule;
use yii\base\Event;

abstract class BaseIntegration implements IntegrationInterface, RulesBasedInterface
{
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Rules')]
    #[Input\Boolean(
        label: 'Enable Rules',
        instructions: 'Enable rules to control when this integration is triggered.',
    )]
    protected bool $enableRules = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.enableRules)')]
    #[ValueTransformer(IntegrationRuleTransformer::class)]
    #[Input\Special\ConditionalIntegrationRule(
        label: 'Rules',
        instructions: 'Specify when this integration should be triggered.',
    )]
    protected ?IntegrationRule $rule;

    public function __construct(
        private ?int $id,
        private ?string $uid,
        private ?string $instanceUid,
        private bool $enabled,
        private bool $legacy,
        private string $handle,
        private string $name,
        private Type $typeDefinition,
        protected LoggerInterface $logger,
    ) {}

    public static function isInstallable(): bool
    {
        return true;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function getInstanceUid(): ?string
    {
        return $this->instanceUid;
    }

    public function setId(int $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function isLegacy(): bool
    {
        return $this->legacy;
    }

    public function isEnableRules(): bool
    {
        return $this->enableRules;
    }

    public function getRule(): ?IntegrationRule
    {
        return $this->rule;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * Returns the MailingList service provider short name
     * i.e. - MailChimp, Constant Contact, etc...
     */
    public function getServiceProvider(): string
    {
        $reflection = (new \ReflectionClass($this));
        $type = $reflection->getAttributes(Type::class);
        $type = reset($type);

        if (!$type) {
            return $reflection->getShortName();
        }

        return $type->newInstance()->name;
    }

    /**
     * Perform anything necessary before this integration is saved.
     */
    public function onBeforeSave(): void {}

    public function getTypeDefinition(): Type
    {
        return $this->typeDefinition;
    }

    protected function triggerAfterResponseEvent(string $category, ResponseInterface $response): void
    {
        $event = new IntegrationResponseEvent($this, $category, $response);
        Event::trigger($this, self::EVENT_AFTER_RESPONSE, $event);
    }

    protected function getProcessedValue(mixed $value): bool|string|null
    {
        return App::parseEnv($value);
    }
}
