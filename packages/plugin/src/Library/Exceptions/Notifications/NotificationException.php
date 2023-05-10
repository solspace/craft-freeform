<?php

namespace Solspace\Freeform\Library\Exceptions\Notifications;

use Solspace\Freeform\Library\Exceptions\FreeformException;

class NotificationException extends FreeformException
{
    public const NO_EMAIL_DIR = 404;
    public const NO_CONTENT = 500;
}
