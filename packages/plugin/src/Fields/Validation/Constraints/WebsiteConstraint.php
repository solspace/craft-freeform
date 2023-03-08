<?php

namespace Solspace\Freeform\Fields\Validation\Constraints;

use Solspace\Freeform\Fields\Validation\Errors\ConstraintViolationList;

class WebsiteConstraint implements ConstraintInterface
{
    public const PATTERN = '/^((((http(s)?)|(sftp)|(ftp)|(ssh)):\/\/)|(\/\/))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)$/i';

    /** @var string */
    private $message;

    /**
     * WebsiteConstraint constructor.
     *
     * @param string $message
     */
    public function __construct($message = 'Website not valid')
    {
        $this->message = $message;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value)
    {
        $violationList = new ConstraintViolationList();

        if (!preg_match(self::PATTERN, $value)) {
            $violationList->addError($this->message);
        }

        return $violationList;
    }
}
