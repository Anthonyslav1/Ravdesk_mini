export const runtime = 'edge';

function frameHtml() {
  const image = 'https://raw.githubusercontent.com/Anthonyslav1/Ravdesk_mini/refs/heads/master/Ravdesk.jpg';
  const miniappJson = JSON.stringify({
    version: '1',
    imageUrl: 'https://raw.githubusercontent.com/Anthonyslav1/Ravdesk_mini/refs/heads/master/Ravdesk.jpg',
    button: {
      title: 'Launch Ravdesk Escrow',
      action: { type: 'launch_miniapp' },
    },
  });
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const postUrl = baseUrl ? `${baseUrl}/api/frame` : '/api/frame';
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta property="og:title" content="Ravdesk Escrow - Frame" />
      <meta property="og:description" content="Secure multi-party escrow onchain" />
      <meta property="og:image" content="${image}" />
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content="${image}" />
      <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
      <meta name="fc:frame:post_url" content="${postUrl}" />
      <meta name="fc:frame:button:1" content="🏦 Create Escrow" />
      <meta name="fc:frame:button:1:action" content="post" />
      <meta name="fc:frame:button:2" content="📊 My Contracts" />
      <meta name="fc:frame:button:2:action" content="post" />
      <meta name="fc:miniapp" content='${miniappJson}' />
    </head>
    <body></body>
  </html>`;
}

export async function GET() {
  return new Response(frameHtml(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST() {
  // Optionally parse form data for button presses
  // const form = await req.formData();
  // const buttonIndex = form.get('untrustedData.buttonIndex');
  return new Response(frameHtml(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
