import { z } from 'zod';

export const consultationSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  consultationType: z.enum(['obstetrics', 'gynaecology', 'fertility'], {
    required_error: 'Pilih jenis konsultasi',
  }),
  message: z.string().max(500, 'Pesan maksimal 500 karakter').optional(),
});

export type ConsultationSchema = z.infer<typeof consultationSchema>;
