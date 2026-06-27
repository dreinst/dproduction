import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  companyName: z.string().min(1),
  status: z.string().nullable().optional(),
  motto1: z.string().nullable().optional(),
  motto2: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  foundedDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  tiktokUrl: z.string().nullable().optional(),
  aboutUs: z.string().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
});

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    let settings = await prisma.kantorSetting.findFirst();
    if (!settings) {
      settings = await prisma.kantorSetting.create({
        data: {
          companyName: 'DPro',
          status: 'Your event partner',
          motto1: 'Your Dream Event',
          motto2: 'Starts Here',
          description: 'Partner with D\\'Production Event Planner and Make Every Moment Truly Remarkable',
          foundedDate: '2016-01-01',
          address: 'Jl. Raya Pandanlandung No. 16 Bandulan, Wagir, Kab. Malang, Jawa Timur',
          phone: '081938938800',
          email: 'dproductionorganizer@gmail.com',
          website: 'http://localhost/dpro',
          facebookUrl: 'https://id-id.facebook.com/kanwilbcgatim2/',
          instagramUrl: 'https://www.instagram.com/dpro.duction',
          youtubeUrl: 'https://youtube.com/@dproductionzone',
          tiktokUrl: '-',
          aboutUs: 'Di D\\'Production, kami percaya setiap acara adalah cerita yang layak diceritakan dengan sempurna. Sebagai Event Organizer terpercaya, kami hadir bukan sekadar menyusun jadwal dan dekorasi, tetap merancang pengalaman yang membekas di hati setiap tamu undangan. Dengan tim profesional yang berdedikasi tinggi, konsep kreatif yang segar, dan eksekusi yang presisi di setiap detail, kami siap mewujudkan Corporate Gathering, Seminar, Product Launching, Gala Dinner, hingga acara skala besar lainnya menjadi momen-momen yang tak terlupakan.',
          googleMapsUrl: 'Google Maps Embed'
        }
      });
    }
    return NextResponse.json([settings]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
