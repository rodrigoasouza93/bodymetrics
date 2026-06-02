import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260602120000_create_bodymetrics_persistence.sql",
  ),
  "utf8",
);

describe("bodymetrics persistence migration", () => {
  it("enables row level security for all sensitive tables", () => {
    const sensitiveTables = [
      "profiles",
      "exam_uploads",
      "body_composition_exams",
      "exam_segmental_analyses",
    ];

    for (const tableName of sensitiveTables) {
      expect(migration).toMatch(
        new RegExp(`alter table public\\.${tableName} enable row level security;`),
      );
    }
  });

  it("restricts table policies to the authenticated user", () => {
    expect(migration).toMatch(/\(select auth\.uid\(\)\) = id/);
    expect(migration).toMatch(/\(select auth\.uid\(\)\) = user_id/);
    expect(migration).toMatch(
      /body_composition_exams\.user_id = \(select auth\.uid\(\)\)/,
    );
  });

  it("creates the private exam-files bucket with first-segment ownership policies", () => {
    expect(migration).toMatch(
      /insert into storage\.buckets \(id, name, public\)\s+values \('exam-files', 'exam-files', false\)/,
    );
    expect(migration).toMatch(/set public = false/);
    expect(migration).toMatch(
      /\(storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/,
    );
  });

  it("keeps upload storage paths aligned to their owning user", () => {
    expect(migration).toMatch(
      /split_part\(storage_path, '\/', 1\) = user_id::text/,
    );
  });

  it("enforces confirmed exams to reference uploads from the same user", () => {
    expect(migration).toMatch(
      /foreign key \(upload_id, user_id\)\s+references public\.exam_uploads\(id, user_id\)/,
    );
  });
});
