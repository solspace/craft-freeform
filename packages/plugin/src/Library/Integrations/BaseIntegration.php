<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations;

use craft\helpers\App;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Freeform;

abstract class BaseIntegration implements IntegrationInterface
{
    public function __construct(
        private ?int $id,
        private bool $enabled,
        private string $handle,
        private string $name,
        private \DateTime $lastUpdate,
    ) {
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getLastUpdate(): \DateTime
    {
        return $this->lastUpdate;
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
    public function onBeforeSave()
    {
    }

    protected function getProcessedValue(mixed $value): bool|string|null
    {
        return App::parseEnv($value);
    }

    protected function getLogger(?string $category = null): LoggerInterface
    {
        return Freeform::$logger->getLogger('Integration'.($category ? '.'.$category : ''));
    }
}
