<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Calculation;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Cards;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Date;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\File;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Html;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Image;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Phone;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Rating;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Signature;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Table;

class FieldProperties extends BaseCategory
{
    public Date $date;
    public Phone $phone;
    public File $file;
    public Html $html;
    public Table $table;
    public Rating $rating;
    public Signature $signature;
    public Calculation $calculation;
    public Cards $cards;
    public Image $image;

    public function getLabel(): string
    {
        return 'Field Properties';
    }

    public function isDelimited(): bool
    {
        return true;
    }

    public function isEnabled(): bool
    {
        return Freeform::getInstance()->edition()->isAtLeast(Freeform::EDITION_PRO);
    }
}
