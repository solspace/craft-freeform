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

namespace Solspace\Freeform\Notifications;

use Solspace\Freeform\Attributes\Property\Input;

abstract class BaseNotification implements NotificationInterface
{
    protected ?int $id;
    protected ?string $uid;

    #[Input\Label]
    protected string $name;

    #[Input\Boolean]
    protected bool $enabled = true;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function getClassName(): string
    {
        return static::class;
    }

    public function getName(): string
    {
        return $this->name;
    }
}
