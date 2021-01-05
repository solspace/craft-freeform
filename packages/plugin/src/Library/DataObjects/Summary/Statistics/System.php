<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\PluginInfo;

class System
{
    /** @var string */
    public $databaseDriver = '';

    /** @var string */
    public $phpVersion = '';

    /** @var string */
    public $craftVersion = '';

    /** @var string */
    public $craftEdition = '';

    /** @var bool */
    public $formFieldType = false;

    /** @var bool */
    public $submissionsFieldType = false;

    /** @var bool */
    public $userGroups = false;

    /** @var bool */
    public $multiSite = false;

    /** @var bool */
    public $languages = false;

    /** @var bool */
    public $legacyFreeform = false;

    /** @var PluginInfo[] */
    public $plugins = [];
}
