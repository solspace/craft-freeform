<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\IpUtils;

class BlacklistedIps extends AbstractCheck
{
    public function handleCheck(ValidationEvent $event)
    {
        $spamIps = $this->getSettings()->getBlockedIpAddresses();

        if (empty($spamIps)) {
            return;
        }

        $remoteIp = \Craft::$app->request->getRemoteIP();
        if (IpUtils::checkIp($remoteIp, $spamIps)) {
            $event->getForm()->markAsSpam(
                SpamReason::TYPE_BLOCKED_IP,
                sprintf(
                    'Form submitted by a blocked IP "%s"',
                    $remoteIp
                )
            );

            if ($this->isDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Your IP has been blocked'));
            }
        }
    }
}
