export interface ConsultationFormData {
  fullName: string;
  email: string;
  phone?: string;
  consultationType: 'obstetrics' | 'gynaecology' | 'fertility';
  message?: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface NavLink {
  href: string;
  label: string;
}
