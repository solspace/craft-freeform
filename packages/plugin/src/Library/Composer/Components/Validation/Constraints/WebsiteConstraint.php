<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class WebsiteConstraint implements ConstraintInterface
{
    const PATTERN = '/^((((http(s)?)|(sftp)|(ftp)|(ssh)):\/\/)|(\/\/))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)$/i';

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
