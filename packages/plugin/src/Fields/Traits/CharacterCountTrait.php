<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\Attributes;

trait CharacterCountTrait
{
    #[Input\Boolean(
        label: 'Show character count',
        instructions: 'Display a live character count below the field. If a maximum length is set, show the limit as well.',
        order: 51,
    )]
    protected bool $showCharacterCount = false;

    public function isShowCharacterCount(): bool
    {
        return $this->showCharacterCount && \in_array($this->getType(), [FieldInterface::TYPE_TEXT, FieldInterface::TYPE_TEXTAREA], true);
    }

    public function getCharacterCountMessages(): array
    {
        return [
            'count' => Freeform::t('{count} characters'),
            'limit' => Freeform::t('{count} / {limit} characters'),
        ];
    }

    private function addCharacterCountAttributes(Attributes $attributes): void
    {
        if (!$this->isShowCharacterCount()) {
            return;
        }

        $messages = $this->getCharacterCountMessages();
        $attributes
            ->replace('data-freeform-character-count', true)
            ->replace('data-character-count-message', $messages['count'])
            ->replace('data-character-count-limit-message', $messages['limit'])
        ;
    }
}
