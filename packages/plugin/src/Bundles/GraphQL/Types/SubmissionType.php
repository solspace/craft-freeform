<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\types\elements\Element;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SubmissionInterface;

class SubmissionType extends Element
{
    public function __construct(array $config)
    {
        $config['interfaces'] = [
            SubmissionInterface::getType(),
        ];

        parent::__construct($config);
    }
}
