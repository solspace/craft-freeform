<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users;

use craft\elements\User;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Library\Helpers\ElementHelper;

class Users implements OptionTypeProviderInterface
{
    #[Input\Select(
        label: 'Group',
        emptyOption: 'All Groups',
        options: UserGroupsOptionsGenerator::class,
    )]
    private ?string $groupId = null;

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/users/fields',
    )]
    private string $label = 'name';

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Value',
        source: 'api/elements/users/fields',
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/users/fields',
    )]
    private string $orderBy = 'id';

    #[Input\Select(
        options: [
            ['value' => 'asc', 'label' => 'Ascending'],
            ['value' => 'desc', 'label' => 'Descending'],
        ],
    )]
    private string $sort = 'asc';

    public function getName(): string
    {
        return 'Users';
    }

    public function getGroupId(): ?string
    {
        return $this->groupId;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getOrderBy(): string
    {
        return $this->orderBy;
    }

    public function getSort(): string
    {
        return $this->sort;
    }

    public function generateOptions(): OptionCollection
    {
        $collection = new OptionCollection();

        $users = User::find()
            ->groupId($this->getGroupId() ?: null)
            ->orderBy($this->getOrderBy().' '.$this->getSort())
            ->all()
        ;

        foreach ($users as $user) {
            $value = ElementHelper::extractFieldValue($user, $this->getValue());
            $label = ElementHelper::extractFieldValue($user, $this->getLabel());

            if (null !== $value && null !== $label) {
                $collection->add($value, $label);
            }
        }

        return $collection;
    }
}
