// Test pilot: redirect ke sentrahai.com/dashboard/intelligence
import { redirect } from 'next/navigation'

export default function IntelligenceDashboardPage(): never {
  redirect('https://sentrahai.com/dashboard/intelligence')
}
