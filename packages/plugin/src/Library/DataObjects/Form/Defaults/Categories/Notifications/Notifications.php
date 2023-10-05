<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications;

use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications\SubCategories\Admin;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications\SubCategories\Conditional;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications\SubCategories\EmailField;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications\SubCategories\UserSelect;

class Notifications extends BaseCategory
{
    public Admin $admin;
    public Conditional $conditional;
    public UserSelect $userSelect;
    public EmailField $emailField;

    public function getLabel(): string
    {
        return 'Notifications Defaults';
    }
}
