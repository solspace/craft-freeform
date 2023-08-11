<?php

namespace Solspace\Freeform\Integrations\MailingLists\MailChimp;

interface MailChimpInterface
{
    public function getDataCenter(): string;

    public function setDataCenter(string $dataCenter): self;
}
