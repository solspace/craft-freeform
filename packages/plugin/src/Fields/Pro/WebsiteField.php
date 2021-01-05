<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\WebsiteConstraint;

class WebsiteField extends TextField implements ExtraFieldInterface
{
    /** @var string */
    protected $customInputType = 'url';

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_WEBSITE;
    }

    /**
     * {@inheritDoc}
     */
    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new WebsiteConstraint($this->translate('Website not valid'));

        return $constraints;
    }
}
