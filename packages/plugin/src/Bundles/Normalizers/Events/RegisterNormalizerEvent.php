<?php

namespace Solspace\Freeform\Bundles\Normalizers\Events;

use Solspace\Freeform\Bundles\Normalizers\NormalizerInterface;
use yii\base\Event;

class RegisterNormalizerEvent extends Event
{
    private array $normalizers = [];

    public function add(string $objectClass, NormalizerInterface $normalizer): self
    {
        $this->normalizers[$objectClass] = $normalizer;

        return $this;
    }

    /**
     * @return array<class-string, NormalizerInterface>
     */
    public function getNormalizers(): array
    {
        return $this->normalizers;
    }
}
