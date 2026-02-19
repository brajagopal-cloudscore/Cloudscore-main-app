import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Admin page redirects to client onboarding for tenant management
  redirect('/admin/client-onboarding');
}