<?php

namespace Solspace\Freeform\Integrations\AI;

/** Optional attachment capability; existing third-party AI integrations remain compatible. */
interface ReferenceAiIntegrationInterface extends AiIntegrationInterface
{
    /** @return string[] MIME types accepted by this integration and configured model. */
    public function getReferenceMimeTypes(): array;
}
