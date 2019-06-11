<?php

namespace Solspace\Freeform\Library\Connections;

use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\Transformers\TransformerInterface;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;

interface ConnectionInterface
{
    /**
     * Determine if the connection has all of its settings readily available
     * and if it is able to create the connection
     *
     * @return bool
     */
    public function isConnectable(): bool;

    /**
     * @param Form                   $form
     * @param TransformerInterface[] $transformers
     *
     * @return ConnectionResult
     */
    public function validate(Form $form, array $transformers): ConnectionResult;

    /**
     * @param Form                   $form
     * @param TransformerInterface[] $transformers
     *
     * @return ConnectionResult
     */
    public function connect(Form $form, array $transformers): ConnectionResult;

    /**
     * @return array
     */
    public function getMapping(): array;
}
