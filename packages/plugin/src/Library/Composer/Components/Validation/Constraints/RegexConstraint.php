<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class RegexConstraint implements ConstraintInterface
{
    /** @var string */
    private $message;

    /** @var string */
    private $pattern;

    /**
     * RegexConstraint constructor.
     *
     * @param string $message
     * @param string $pattern
     */
    public function __construct($message, $pattern = null)
    {
        $this->message = $message ?: 'Value is not valid';
        $this->pattern = $pattern ?: null;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value)
    {
        $violationList = new ConstraintViolationList();

        $pattern = $this->pattern;
        if (null === $pattern) {
            return $violationList;
        }

        if ('/' !== $pattern[0]) {
            $pattern = '/'.$pattern;
        }

        if ('/' !== $pattern[max(0, \strlen($pattern) - 1)]) {
            $pattern .= '/';
        }

        if (!preg_match($pattern, $value)) {
            $message = str_replace('{{pattern}}', $pattern, $this->message);

            $violationList->addError($message);
        }

        return $violationList;
    }
}
