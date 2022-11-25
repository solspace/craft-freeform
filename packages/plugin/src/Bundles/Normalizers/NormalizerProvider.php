<?php

namespace Solspace\Freeform\Bundles\Normalizers;

use Solspace\Freeform\Bundles\Normalizers\Events\RegisterNormalizerEvent;
use Solspace\Freeform\Bundles\Normalizers\Exceptions\NoNormalizerRegisteredException;
use Solspace\Freeform\Bundles\Normalizers\Implementations\FormNormalizer;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class NormalizerProvider
{
    public const EVENT_REGISTER_NORMALIZER = 'register-serializer';

    /** @var array<class-string, NormalizerInterface> */
    private array $normalizerMap;

    public function __construct()
    {
        Event::on(
            self::class,
            self::EVENT_REGISTER_NORMALIZER,
            [$this, 'registerNormalizers']
        );

        $event = new RegisterNormalizerEvent();
        Event::trigger(self::class, self::EVENT_REGISTER_NORMALIZER, $event);

        $this->normalizerMap = $event->getNormalizers();
    }

    public function registerNormalizers(RegisterNormalizerEvent $event): void
    {
        $container = \Craft::$container;

        $event->add(Form::class, $container->get(FormNormalizer::class));
    }

    public function hasNormalizer(object $object): bool
    {
        return \array_key_exists(\get_class($object), $this->normalizerMap);
    }

    public function normalize(array|object $object): mixed
    {
        if (\is_array($object)) {
            return array_map(fn ($item) => $this->normalize($item), $object);
        }

        $reflection = new \ReflectionClass($object);
        foreach ($this->normalizerMap as $class => $normalizer) {
            if ($reflection->isSubclassOf($class)) {
                return $normalizer->normalize($object);
            }
        }

        throw new NoNormalizerRegisteredException(
            sprintf('No normalizer registered for "%s"', $objectClass)
        );
    }

    public function denormalize(string $serialized): object
    {
    }
}
