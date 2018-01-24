<?php

namespace Solspace\Freeform\Events\Mailer;

use craft\events\CancelableEvent;
use craft\mail\Message;

class SendEmailEvent extends CancelableEvent
{
    /** @var Message */
    private $message;

    /**
     * @param Message $message
     */
    public function __construct(Message $message)
    {
        $this->message = $message;

        parent::__construct([]);
    }

    /**
     * @return Message
     */
    public function getMessage(): Message
    {
        return $this->message;
    }
}
