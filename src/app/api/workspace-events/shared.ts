import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { can } from '@/lib/rbac';

// Honor dan status bayar hanya ikut untuk yang boleh membaca Salary. Status administrasi (Report) tidak pernah dikirim di sini.
export function assignmentSelect(role: string) {
  const salary = can(role, 'salary', 'read');
  return {
    id: true,
    crew: { select: { id: true, name: true } },
    jobDesc: { select: { id: true, name: true } },
    honor: salary,
    paid: salary,
    paidAt: salary,
  } satisfies Prisma.AssignmentSelect;
}

export function eventSelect(role: string) {
  return {
    id: true,
    name: true,
    client: true,
    location: true,
    startAt: true,
    endAt: true,
    status: true,
    photoUrl: true,
    videoUrl: true,
    notes: true,
    gradeEvent: { select: { id: true, grade: true } },
    assignments: { select: assignmentSelect(role), orderBy: { id: 'asc' } },
  } satisfies Prisma.WorkspaceEventSelect;
}

// ID rujukan dari body (crewId, jobDescId, gradeEventId).
export const zRefId = (label: string) => {
  const message = `${label} tidak valid.`;
  return z.number({ error: message }).int(message).positive(message).max(2147483647, message);
};

// Nama field yang nilainya benar-benar berubah, untuk ringkasan audit tanpa isi datanya.
export function changedFields(input: Record<string, unknown>, current: Record<string, unknown>) {
  return Object.keys(input).filter((key) => {
    const next = input[key] ?? null;
    const prev = current[key] ?? null;
    return next instanceof Date && prev instanceof Date ? next.getTime() !== prev.getTime() : next !== prev;
  });
}
