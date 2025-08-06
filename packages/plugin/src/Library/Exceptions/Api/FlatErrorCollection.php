<?php

namespace Solspace\Freeform\Library\Exceptions\Api;

use yii\base\Model;

class FlatErrorCollection implements ApiErrorCollectionInterface
{
    private array $errors = [];

    public static function fromModel(Model $model): self
    {
        $instance = new self();
        if (!$model->hasErrors()) {
            return $instance;
        }

        $instance->errors = $model->getErrors();

        return $instance;
    }

    public function add(array|string $message): self
    {
        if (\is_string($message)) {
            $message = [$message];
        }

        $this->errors = array_merge($this->errors, $message);

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
