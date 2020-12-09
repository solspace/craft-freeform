<?php

namespace Solspace\Freeform\Library\Connections;

use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\Transformers\TransformerInterface;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;

interface ConnectionInterface
{
    /**
     * Determine if the connection has all of its settings readily available
     * and if it is able to create the connection.
     */
    public function isConnectable(): bool;

    /**
     * @param TransformerInterface[] $transformers
     */
    public function validate(Form $form, array $transformers): ConnectionResult;

    /**
     * @param TransformerInterface[] $transformers
     */
    public function connect(Form $form, array $transformers): ConnectionResult;

    public function getMapping(): array;
}
