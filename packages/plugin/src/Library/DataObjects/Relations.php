<?php

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Library\DataObjects\Relations\Relationship;

class Relations
{
    /** @var Relationship[] */
    private $relations = [];

    /**
     * Relations constructor.
     *
     * @param array $data
     */
    public function __construct($data)
    {
        if (\is_array($data)) {
            foreach ($data as $key => $value) {
                if (!\is_array($value)) {
                    $value = $value ? [$value] : [];
                }

                foreach ($value as $elementId) {
                    $this->relations[] = new Relationship($elementId, $key);
                }
            }
        }
    }

    /**
     * @return array|Relationship[]
     */
    public function getRelationships(): array
    {
        return $this->relations;
    }
}
