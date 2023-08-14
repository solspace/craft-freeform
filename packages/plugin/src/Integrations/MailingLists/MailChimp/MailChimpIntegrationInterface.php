<?php

namespace Solspace\Freeform\Integrations\MailingLists\MailChimp;

interface MailChimpIntegrationInterface
{
    public function getDataCenter(): string;

    public function setDataCenter(string $dataCenter): self;
}
