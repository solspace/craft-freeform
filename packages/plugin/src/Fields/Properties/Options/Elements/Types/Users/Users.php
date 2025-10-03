<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users;

use craft\elements\User;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\BaseOptionProvider;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Users extends BaseOptionProvider
{
    #[Input\Select(
        label: 'Group',
        emptyOption: 'All Groups',
        options: UserGroupsOptionsGenerator::class,
    )]
    private ?string $groupId = null;

    #[Input\DynamicCheckboxes(
        label: 'Status',
        source: 'api/elements/statuses?type='.User::class,
    )]
    private array $status = [User::STATUS_ACTIVE];

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Label',
        source: 'api/elements/users/fields',
    )]
    private string $label = 'fullName';

    #[Required]
    #[Input\DynamicSelect(
        label: 'Option Value',
        source: 'api/elements/users/fields',
    )]
    private string $value = 'id';

    #[Input\DynamicSelect(
        label: 'Order By',
        source: 'api/elements/users/fields?order',
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

    public function getStatus(): array
    {
        return $this->status;
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

    protected function getElements(TranslationTable $translationTable): array
    {
        $groupId = $translationTable->get('optionConfiguration.properties.groupId') ?: $this->getGroupId();
        $status = $translationTable->get('optionConfiguration.properties.status') ?: $this->getStatus();

        $orderBy = $translationTable->get('optionConfiguration.properties.orderBy') ?: $this->getOrderBy();
        $sort = $translationTable->get('optionConfiguration.properties.sort') ?: $this->getSort();

        return User::find()
            ->groupId($groupId)
            ->status($status)
            ->orderBy($orderBy.' '.$sort)
            ->all()
        ;
    }
}
