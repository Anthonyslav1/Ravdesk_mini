"use client";

import React from 'react';
import Business from '../../components/Business.jsx';

export default function BusinessPage() {
  return (
    <div className="miniapp-bridge">
      <Business />
      <style jsx global>{`
        .miniapp-bridge nav, .miniapp-bridge footer { display: none !important; }
      `}</style>
    </div>
  );
}
