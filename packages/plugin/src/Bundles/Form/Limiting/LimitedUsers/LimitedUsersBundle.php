<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use craft\base\Plugin;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class LimitedUsersBundle extends FeatureBundle
{
    public function __construct(
        private LimitedUserChecker $limitedUserChecker
    ) {
        Event::on(
            Plugin::class,
            Plugin::EVENT_AFTER_ACTION,
            [$this, 'test'],
        );
    }

    public function test()
    {
        if (1 === \Craft::$app->getUser()->id) {
            return;
        }

        $checker = $this->limitedUserChecker;

        // dd($checker->can('settings.tab.general.handle'));
    }
}
