<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test public landing homepage returns HTTP 200 OK
     */
    public function test_the_public_landing_page_loads_successfully(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
