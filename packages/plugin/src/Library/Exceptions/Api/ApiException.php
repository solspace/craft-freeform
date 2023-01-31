<?php

namespace Solspace\Freeform\Library\Exceptions\Api;

use Solspace\Freeform\Library\Exceptions\FreeformException;

class ApiException extends FreeformException
{
    public function __construct(int $code, private ErrorCollection $errors)
    {
        parent::__construct('Error', $code, null);
    }

    public function getErrors(): ErrorCollection
    {
        return $this->errors;
    }
}
