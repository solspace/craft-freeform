<?php

namespace Solspace\Freeform\Events\Notifications;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Notifications\AbstractNotification;

class NotificationResponseEvent extends CancelableArrayableEvent
{
    private AbstractNotification $notification;

    private ResponseInterface $response;

    /**
     * @param AbstractNotification $notification
     * @param ResponseInterface $response
     */
    public function __construct(AbstractNotification $notification, ResponseInterface $response)
    {
        $this->notification = $notification;
        $this->response = $response;

        parent::__construct();
    }

    /**
     * @return array
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['notification', 'response']);
    }

    /**
     * @return AbstractNotification
     */
    public function getNotification(): AbstractNotification
    {
        return $this->notification;
    }

    /**
     * @return ResponseInterface
     */
    public function getResponse(): ResponseInterface
    {
        return $this->response;
    }

    /**
     * @return string
     */
    public function getResponseBodyAsString(): string
    {
        return (string) $this->getResponse()->getBody();
    }
}
