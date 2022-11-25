<?php

namespace Solspace\Tests\Freeform\Unit\Form\Layout;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;

/**
 * @internal
 *
 * @coversNothing
 */
class LayoutTest extends TestCase
{
    public function testIteratePages()
    {
        $layout = new Layout();
        $layout->getPages()
            ->add(new Page(['label' => 'Page One']))
            ->add(new Page(['label' => 'Page Two']))
        ;

        $labels = [];
        foreach ($layout as $page) {
            $labels[] = $page->getLabel();
        }

        $this->assertSame(['Page One', 'Page Two'], $labels);
    }

    public function testCountPages()
    {
        $layout = new Layout();
        $layout->getPages()
            ->add(new Page(['label' => 'Page One']))
            ->add(new Page(['label' => 'Page Two']))
        ;

        $this->assertCount(2, $layout);
    }
}
