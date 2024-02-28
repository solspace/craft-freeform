<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\SubmissionCollection;

class FormSubmissions
{
    public string $formUid;
    public SubmissionCollection $submissions;
}
