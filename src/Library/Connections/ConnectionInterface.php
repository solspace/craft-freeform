<?php

namespace Solspace\Freeform\Library\Connections;

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
     * @param array $keyValuePairs
     *
     * @return ConnectionResult
     */
    public function validate(array $keyValuePairs): ConnectionResult;

    /**
     * @param array $keyValuePairs
     *
     * @return ConnectionResult
     */
    public function connect(array $keyValuePairs): ConnectionResult;

    /**
     * @return array
     */
    public function getMapping(): array;
}
