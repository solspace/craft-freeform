<?php

namespace Solspace\Freeform\Events\Export\Profiles;

use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Export\ExportInterface;
use yii\base\Event;

class RegisterExporterEvent extends Event
{
    /** @var ExportInterface[] */
    private $exporters = [];

    /**
     * @return ExportInterface[]
     */
    public function getExporters(): array
    {
        return $this->exporters;
    }

    /**
     * @throws FreeformException
     * @throws \ReflectionException
     */
    public function addExporter(string $key, string $class): self
    {
        $reflection = new \ReflectionClass($class);
        if (!$reflection->implementsInterface(ExportInterface::class)) {
            throw new FreeformException('Registered exporter does not implement '.ExportInterface::class);
        }

        $this->exporters[$key] = $class;

        return $this;
    }
}
