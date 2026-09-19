<?php

namespace Solspace\Freeform\Fields\Implementations;

// Preserve Range fields saved while testing the original feature branch.
// New fields and installation defaults use the canonical Pro class.
class_alias(Pro\RangeField::class, __NAMESPACE__.'\RangeField');
