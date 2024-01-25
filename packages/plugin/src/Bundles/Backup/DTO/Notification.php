<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class Notification
{
    public string $name;
    public string $type;
    public string $id;
    public string $idAttribute;
    public array $metadata = [];
}
