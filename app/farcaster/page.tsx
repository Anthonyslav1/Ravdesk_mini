import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

// Reuse the same dashboard as the main page

export const metadata: Metadata = {
  title: 'Ravdesk Escrow - Secure Multi-Party Contracts',
  description: 'Revolutionary blockchain escrow platform for secure payments',
};

export default function FarcasterPage() {
  // Render the exact same UI as the main route
  return <DashboardClient />;
}
