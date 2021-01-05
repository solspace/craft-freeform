<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Library\Composer\Components\Properties\FieldProperties;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;

abstract class BaseRule
{
    const TYPE_MATCH_ALL = 'all';
    const TYPE_MATCH_ANY = 'any';

    /** @var bool */
    private $matchAll;

    /** @var FieldCriteria[] */
    private $criteria;

    /**
     * FieldRule constructor.
     */
    public function __construct(bool $matchAll, array $criteria, callable $getFieldProps)
    {
        $this->matchAll = $matchAll;

        $criteriaObjects = [];
        foreach ($criteria as $item) {
            try {
                /** @var FieldProperties $fieldProperties */
                $fieldProperties = $getFieldProps($item['hash']);
            } catch (ComposerException $exception) {
                continue;
            }

            $handle = $fieldProperties->getHandle() ?? $fieldProperties->getHash();
            if (null === $handle || '' === trim($handle)) {
                continue;
            }

            $criteriaObjects[] = new FieldCriteria(
                $item['hash'],
                $handle,
                (bool) $item['equals'],
                $item['value']
            );
        }

        $this->criteria = $criteriaObjects;
    }

    public function isMatchAll(): bool
    {
        return $this->matchAll;
    }

    public function isMatchAny(): bool
    {
        return !$this->isMatchAll();
    }

    /**
     * @return FieldCriteria[]
     */
    public function getCriteria(): array
    {
        return $this->criteria;
    }
}
