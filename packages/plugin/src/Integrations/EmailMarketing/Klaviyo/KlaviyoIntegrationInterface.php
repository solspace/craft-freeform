<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\Klaviyo;

interface KlaviyoIntegrationInterface
{
    public function getApiKey(): string;

    public function getApiRevision(): string;
}
