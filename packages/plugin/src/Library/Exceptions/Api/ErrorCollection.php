<?php

namespace Solspace\Freeform\Library\Exceptions\Api;

use yii\db\ActiveRecord;

class ErrorCollection
{
    private array $errors = [];

    public function fromRecord(string $category, ActiveRecord $record): self
    {
        if (!$record->hasErrors()) {
            return $this;
        }

        if (!isset($this->errors[$category])) {
            $this->errors[$category] = [];
        }

        foreach ($record->getErrors() as $target => $messages) {
            if (!isset($this->errors[$category][$target])) {
                $this->errors[$category][$target] = [];
            }

            foreach ($messages as $message) {
                $this->errors[$category][$target][] = $message;
            }
        }

        return $this;
    }

    public function add(string $category, string $target, array $messages): self
    {
        $this->errors[$category][$target] = [...$messages];

        return $this;
    }

    public function hasErrors(): bool
    {
        return (bool) $this->errors;
    }

    public function asArray(): array
    {
        return $this->errors;
    }
}
