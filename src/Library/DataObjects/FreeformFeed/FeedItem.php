<?php

namespace Solspace\Freeform\Library\DataObjects\FreeformFeed;

class FeedItem
{
    private $id;

    /** @var int */
    private $timestamp;

    /** @var AffectedVersions */
    private $affectedVersions;

    /** @var Notification[] */
    private $notifications;

    public function __construct(array $data)
    {
        $this->id = $data['id'];
        $this->timestamp = $data['timestamp'];
        $this->affectedVersions = new AffectedVersions();
        $this->affectedVersions->min = $data['affectedVersions']['min'] ?? null;
        $this->affectedVersions->max = $data['affectedVersions']['max'] ?? null;

        $this->notifications = [];
        foreach ($data['notifications'] as $notificationData) {
            $this->notifications[] = new Notification($notificationData);
        }
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getTimestamp(): int
    {
        return $this->timestamp;
    }

    public function getAffectedVersions(): AffectedVersions
    {
        return $this->affectedVersions;
    }

    public function getNotifications(): array
    {
        return $this->notifications;
    }
}
