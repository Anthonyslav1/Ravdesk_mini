"use client";

import React from 'react';
import FAQs from '../../components/FAQs.jsx';

export default function FAQsPage() {
  return (
    <div className="miniapp-bridge">
      <FAQs />
      <style jsx global>{`
        .miniapp-bridge nav, .miniapp-bridge footer { display: none !important; }
      `}</style>
    </div>
  );
}
