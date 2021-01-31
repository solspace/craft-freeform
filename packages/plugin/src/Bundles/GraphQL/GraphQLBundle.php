<?php

namespace Solspace\Freeform\Bundles\GraphQL;

use craft\events\RegisterGqlQueriesEvent;
use craft\events\RegisterGqlSchemaComponentsEvent;
use craft\events\RegisterGqlTypesEvent;
use craft\services\Gql;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RowInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\CsrfTokenInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\HoneypotInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\KeyValueMapInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\OptionsInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\ScalesInterface;
use Solspace\Freeform\Bundles\GraphQL\Queries\FreeformQuery;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use yii\base\Event;

class GraphQLBundle implements BundleInterface
{
    public function __construct()
    {
        if (version_compare(\Craft::$app->version, '3.5.0', '<')) {
            return;
        }

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_TYPES,
            function (RegisterGqlTypesEvent $event) {
                $event->types[] = FreeformInterface::class;
                $event->types[] = FormInterface::class;
                $event->types[] = FieldInterface::class;
                $event->types[] = PageInterface::class;
                $event->types[] = RowInterface::class;
                $event->types[] = KeyValueMapInterface::class;
                $event->types[] = OptionsInterface::class;
                $event->types[] = ScalesInterface::class;
                $event->types[] = HoneypotInterface::class;
                $event->types[] = CsrfTokenInterface::class;
            }
        );

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_QUERIES,
            function (RegisterGqlQueriesEvent $event) {
                $event->queries = array_merge(
                    $event->queries,
                    FreeformQuery::getQueries()
                );
            }
        );

        Event::on(
            Gql::class,
            Gql::EVENT_REGISTER_GQL_SCHEMA_COMPONENTS,
            function (RegisterGqlSchemaComponentsEvent $event) {
                $freeform = Freeform::getInstance();
                $formsCategory = GqlPermissions::CATEGORY_FORMS;

                $nestedFormPermissions = [];
                $forms = $freeform->forms->getAllForms();
                foreach ($forms as $form) {
                    $uid = $form->uid;
                    $nestedFormPermissions["{$formsCategory}.{$uid}:read"] = [
                        'label' => Freeform::t(
                            'View "{form}" form',
                            ['form' => $form->name]
                        ),
                    ];
                }

                $permissions = [
                    "{$formsCategory}.all:read" => [
                        'label' => Freeform::t('View All Forms'),
                        'nested' => $nestedFormPermissions,
                    ],
                ];

                $event->queries[$freeform->name] = $permissions;
            }
        );
    }
}
