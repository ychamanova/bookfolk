-- Fails (and rolls back) if any club has an owner_id that is not a valid neon_auth user id; fix or remove those rows first.
ALTER TABLE "book_clubs" ALTER COLUMN "owner_id" SET DATA TYPE uuid USING "owner_id"::uuid;--> statement-breakpoint
ALTER TABLE "book_clubs" ADD CONSTRAINT "book_clubs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_clubs_owner_idx" ON "book_clubs" USING btree ("owner_id");