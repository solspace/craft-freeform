<?php

namespace Solspace\Freeform\Bundles\Normalizers;

interface NormalizerInterface
{
    public function normalize(object $object): mixed;

    public function denormalize($object): object;
}
