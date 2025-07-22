import { redirect } from 'next/navigation';

export default function BetaPage() {
  // Beta system is disabled, redirect to regular signup
  redirect('/signup');
  
  return null;
}