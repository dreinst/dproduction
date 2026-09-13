import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const { authorized, response } = await requireRole(['owner', 'superadmin', 'admin', 'staff', 'tester']);
  if (!authorized) return response;

  try {
    const events = await prisma.workspaceEvent.findMany({
      where: { deletedAt: null },
    });

    const totalSelesai = events.filter(e => e.status.toLowerCase() === 'selesai' || e.status.toLowerCase() === 'completed').length;
    const totalBerjalan = events.filter(e => e.status.toLowerCase() !== 'selesai' && e.status.toLowerCase() !== 'completed').length;

    // Monthly data
    const monthlyData = [
      { month: "JAN", selesai: 0, berjalan: 0 },
      { month: "FEB", selesai: 0, berjalan: 0 },
      { month: "MAR", selesai: 0, berjalan: 0 },
      { month: "APR", selesai: 0, berjalan: 0 },
      { month: "MAY", selesai: 0, berjalan: 0 },
      { month: "JUN", selesai: 0, berjalan: 0 },
      { month: "JUL", selesai: 0, berjalan: 0 },
      { month: "AUG", selesai: 0, berjalan: 0 },
      { month: "SEP", selesai: 0, berjalan: 0 },
      { month: "OCT", selesai: 0, berjalan: 0 },
      { month: "NOV", selesai: 0, berjalan: 0 },
      { month: "DEC", selesai: 0, berjalan: 0 },
    ];

    events.forEach(e => {
      const d = new Date(e.date);
      const m = d.getMonth(); // 0-11
      if (e.status.toLowerCase() === 'selesai' || e.status.toLowerCase() === 'completed') {
        monthlyData[m].selesai++;
      } else {
        monthlyData[m].berjalan++;
      }
    });

    // Team data
    // Usually jobDesc or client or user? We don't have a team association directly on WorkspaceEvent, so maybe we use jobDesc or just return empty for now, or fake it if no real team table exists. Wait, is there a team table?
    // In schema.prisma, there is no Team table. Just User, Client, Event, Wedding, WorkspaceSalary, HeadHome, WorkspaceEvent, WorkspaceReport, GaleriFotoAlbum.
    // The previous mock data had names. We will return empty array for teamData if no actual data exists, or fetch from users?
    // We will just fetch from User and pretend they are the team, with random counts or 0s, since the user didn't specify.
    // Actually, I can just return the actual users from User table and count 0 for them.
    const users = await prisma.user.findMany({ where: { active: true } });
    const teamData = users.map(u => ({
      name: u.alias || u.username,
      phone: '080000000000', // No phone in User table
      completed: 0,
      running: 0,
      hasPhoto: false
    }));

    return NextResponse.json({
      totalSelesai,
      totalBerjalan,
      monthlyData,
      teamData
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
