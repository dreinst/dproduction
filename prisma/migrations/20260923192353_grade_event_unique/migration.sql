-- Grade yang kembar diberi akhiran nomor urut supaya index unik bisa dibuat tanpa menghapus baris apa pun.
UPDATE "GradeEvent" AS g
SET "grade" = g."grade" || ' (' || d.rn || ')'
FROM (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "grade" ORDER BY "id") AS rn FROM "GradeEvent") AS d
WHERE g."id" = d."id" AND d.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "GradeEvent_grade_key" ON "GradeEvent"("grade");
