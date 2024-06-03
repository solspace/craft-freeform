<?php

namespace Solspace\Freeform\Integrations\Elements\User\EventListeners;

use craft\base\Model;
use craft\elements\User as CraftUser;
use craft\events\DefineRulesEvent;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Integrations\Elements\User\User;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class PasswordTransform extends FeatureBundle
{
    private ?int $minLength = null;

    public function __construct()
    {
        Event::on(
            User::class,
            User::EVENT_PROCESS_VALUE,
            [$this, 'processPassword']
        );

        Event::on(
            CraftUser::class,
            Model::EVENT_DEFINE_RULES,
            function (DefineRulesEvent $event) {
                if (!$this->minLength) {
                    return;
                }

                foreach ($event->rules as $key => $rule) {
                    if (isset($rule[0]) && $rule[0] === ['newPassword']) {
                        unset($event->rules[$key]);
                    }
                }
            }
        );
    }

    public function processPassword(ProcessValueEvent $event): void
    {
        if (!$event->getIntegration() instanceof User) {
            return;
        }

        if ('newPassword' !== $event->getHandle()) {
            return;
        }

        $minLength = $event->getFreeformField()->getMinLength();
        if ($minLength) {
            $this->minLength = $minLength;
        }

        $value = $event->getValue();
        if (empty($value)) {
            $event->setValue(null);
        }
    }
}
