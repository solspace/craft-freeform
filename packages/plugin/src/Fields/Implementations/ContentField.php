<?php

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\NoLabelInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;

#[Type(name: 'Content', typeShorthand: 'content', iconPath: __DIR__.'/Icons/content.svg')]
class ContentField extends AbstractField implements ExtraFieldInterface, InputOnlyInterface, NoStorageInterface, NoEmailPresenceInterface, NoLabelInterface
{
    protected string $instructions = '';
    protected bool $required = false;

    public function getType(): string
    {
        return 'content';
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    protected function getInputHtml(): string
    {
        return '';
    }
}
