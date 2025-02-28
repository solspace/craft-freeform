<?php

namespace Solspace\Freeform\Integrations\Elements\User\EventListeners;

use craft\elements\User as CraftUser;
use craft\helpers\Db;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ValidateEvent;
use Solspace\Freeform\Integrations\Elements\User\User;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class ExistingUserCheck extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            ElementIntegrationInterface::class,
            ElementIntegrationInterface::EVENT_AFTER_VALIDATE,
            [$this, 'checkForExistingUser']
        );
    }

    public function checkForExistingUser(ValidateEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof User) {
            return;
        }

        $element = $event->getElement();
        if (!$element instanceof CraftUser) {
            return;
        }

        $mapping = $integration->getAttributeMapping();
        $isEmailMapped = $mapping->isSourceMapped('email');
        $isUsernameMapped = $mapping->isSourceMapped('username');

        if ($isUsernameMapped) {
            $usernameSearch = CraftUser::find()->username(Db::escapeParam($element->username));
            if ($element->id) {
                $usernameSearch->id('!= '.$element->id);
            }

            if ($usernameSearch->exists()) {
                $element->addError('username', \Craft::t('app', 'Username already exists.'));
            }
        }

        if ($isEmailMapped) {
            $emailSearch = CraftUser::find()->email(Db::escapeParam($element->email));
            if ($element->id) {
                $emailSearch->id('!= '.$element->id);
            }

            if ($emailSearch->exists()) {
                $element->addError('email', \Craft::t('app', 'Email is in use already.'));
            }
        }
    }
}
