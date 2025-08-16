"use client";

import React from 'react';
import Freelancers from '../../components/Freelancers.jsx';

export default function FreelancersPage() {
  return (
    <div className="miniapp-bridge">
      <Freelancers />
      <style jsx global>{`
        .miniapp-bridge nav, .miniapp-bridge footer { display: none !important; }
      `}</style>
    </div>
  );
}
