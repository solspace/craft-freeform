<?php

namespace Solspace\Freeform\Tests\Fixtures;

use yii\base\Behavior;

/**
 * Native-property query fixtures do not need Craft's runtime-generated field accessors.
 */
class CustomFieldQueryBehavior extends Behavior
{
    public bool $hasMethods = false;
}
