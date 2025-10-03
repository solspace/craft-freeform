<?php

namespace Solspace\Freeform\Library\Translations;

use Symfony\Component\PropertyAccess\PropertyAccessor;

class TranslationTable
{
    private ?object $table = null;

    public function __construct(array|object|null $translations = null)
    {
        if (\is_array($translations)) {
            $this->table = (object) $translations;
        } else {
            $this->table = $translations;
        }
    }

    public function hasTranslations(): bool
    {
        return !empty($this->table);
    }

    public function get(string $path, mixed $defaultValue = null): mixed
    {
        if (!$this->hasTranslations()) {
            return $defaultValue;
        }

        $accessor = $this->getPropertyAccessor();

        $readable = $accessor->isReadable($this->table, $path);
        if (!$readable) {
            return $defaultValue;
        }

        return $accessor->getValue($this->table, $path);
    }

    private function getPropertyAccessor(): PropertyAccessor
    {
        static $accessor;

        if (null === $accessor) {
            $accessor = new PropertyAccessor();
        }

        return $accessor;
    }
}
