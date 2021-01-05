<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class PhoneConstraint implements ConstraintInterface
{
    /** @var string */
    private $message;

    /**
     * The pattern is going to look like this:
     * (xxx) xxxx xxx
     * Anything other than an X is going to be assumed literal
     * an X stands for any digit between 0 and 9.
     *
     * @var string
     */
    private $pattern;

    /**
     * RegexConstraint constructor.
     *
     * @param string $message
     * @param string $pattern
     */
    public function __construct($message = 'Invalid phone number', $pattern = null)
    {
        $this->message = $message;
        $this->pattern = !empty($pattern) ? $pattern : null;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value)
    {
        $violationList = new ConstraintViolationList();
        $pattern = $this->pattern;

        if (null !== $pattern) {
            $compiledPattern = $pattern;
            $compiledPattern = preg_replace('/([\[\](){}$+_\-+])/', '\\\\$1', $compiledPattern);
            preg_match_all('/(0+)/', $compiledPattern, $matches);

            if (isset($matches[1])) {
                foreach ($matches[1] as $match) {
                    $compiledPattern = preg_replace(
                        '/'.$match.'/',
                        '[0-9]{'.\strlen($match).'}',
                        $compiledPattern,
                        1
                    );
                }
            }

            $compiledPattern = '/^'.$compiledPattern.'$/';

            try {
                $valid = preg_match($compiledPattern, $value);
            } catch (\Exception $e) {
                $valid = false;
            }

            if (!$valid) {
                $violationList->addError($this->message);
            }

            return $violationList;
        }

        if (!preg_match('/^\+?[0-9\- ,.\(\)]+$/', $value)) {
            $violationList->addError($this->message);
        }

        return $violationList;
    }
}
