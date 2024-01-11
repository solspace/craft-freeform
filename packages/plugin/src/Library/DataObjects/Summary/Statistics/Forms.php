<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

class Forms
{
    public bool $multiPage = false;
    public bool $builtInAjax = false;
    public bool $notStoringSubmissions = false;
    public bool $collectIp = false;
    public bool $optInDataStorage = false;
    public bool $limitSubmissionRate = false;
    public bool $formTagAttributes = false;
    public bool $loadingIndicators = false;
    public array $types = [];
}
