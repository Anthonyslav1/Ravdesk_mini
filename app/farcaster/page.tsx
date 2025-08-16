import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Reuse the same dashboard as the main page
const DashboardLegacy = dynamic(() => import('../../components/Dashboard.jsx'), { ssr: false });

export const metadata: Metadata = {
  title: 'Ravdesk Escrow - Secure Multi-Party Contracts',
  description: 'Revolutionary blockchain escrow platform for secure payments',
};

export default function FarcasterPage() {
  // Render the exact same UI as the main route
  return <DashboardLegacy hideChrome />;
}
