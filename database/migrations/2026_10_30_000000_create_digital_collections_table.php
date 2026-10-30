<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('digital_collections', function (Blueprint $table) {
            $table->id();
            $table->string('collection_type')->index(); // magazine | newspaper | ebook | book_proposal
            $table->string('title');
            $table->string('author')->nullable();
            $table->string('publisher')->nullable();
            $table->string('prodi')->nullable()->index();
            $table->string('issn')->nullable();
            $table->string('e_issn')->nullable();
            $table->string('frequency')->nullable();
            $table->string('edition')->nullable();
            $table->year('publish_year')->nullable();
            $table->text('description')->nullable();
            $table->string('access_url')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('proposer_name')->nullable();
            $table->string('proposer_prodi')->nullable();
            $table->string('proposer_contact')->nullable();
            $table->decimal('estimated_price', 12, 2)->nullable();
            $table->string('review_status')->default('pending')->index(); // pending | approved | rejected
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_collections');
    }
};
