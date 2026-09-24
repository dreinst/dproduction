import prisma from '@/lib/prisma';

export type AuditActor = { id: number | null; username: string };
export type AuditAction = 'tambah' | 'ubah' | 'hapus';

// Mencatat perubahan data ke AuditLog. Gagal mencatat tidak boleh menggagalkan request, jadi error hanya ditulis ke log.
// summary tidak boleh memuat data pribadi: tanpa nomor WhatsApp, isi pesan lead, atau password. Cukup nama data
// atau field yang berubah, misalnya "status: lunas" atau "honor diubah".
export async function audit(
  actor: AuditActor,
  action: AuditAction,
  entity: string,
  entityId: number | null = null,
  summary: string | null = null,
) {
  try {
    await prisma.auditLog.create({
      data: { userId: actor.id, username: actor.username, action, entity, entityId, summary },
    });
  } catch (error) {
    const { name, code } = (error ?? {}) as { name?: unknown; code?: unknown };
    console.error(`Gagal menulis audit log: ${typeof name === 'string' ? name : 'tidak diketahui'} ${code ?? ''}`.trim());
  }
}
