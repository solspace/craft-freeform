<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
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
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use yii\base\Event;

abstract class BaseIntegration implements IntegrationInterface
{
    public function __construct(
        private ?int $id,
        private ?int $instanceId,
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

    public function getInstanceId(): ?int
    {
        return $this->instanceId;
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

    protected function getProcessedBoolean(mixed $value): bool
    {
        return BooleanHelper::normalize($value);
    }
}
