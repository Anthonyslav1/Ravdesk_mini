// Farcaster Miniapp Configuration
export const FARCASTER_CONFIG = {
  // Miniapp metadata
  version: "1",
  name: "Ravdesk Escrow",
  description: "Secure multi-party escrow contracts on blockchain",
  imageUrl: "https://placehold.co/600x400/png?text=Ravdesk+Miniapp", // 3:2 aspect ratio image
  
  // Frame configuration
  buttons: [
    {
      title: "🏦 Create Escrow",
      action: "create_contract"
    },
    {
      title: "📊 View Contracts", 
      action: "view_contracts"
    },
    {
      title: "💰 Deposit Funds",
      action: "deposit_funds"
    },
    {
      title: "✅ Complete Deal",
      action: "complete_milestone"
    }
  ],
  
  // Miniapp embed structure
  embed: {
    version: "1",
    imageUrl: "https://placehold.co/600x400/png?text=Ravdesk+Miniapp",
    button: {
      title: "Launch Ravdesk Escrow",
      action: {
        type: "launch_miniapp"
      }
    }
  }
};

// Generate meta tags for Farcaster frame
export const generateFrameMetaTags = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  const metaTags = [
    // OpenGraph fallback
    { property: "og:title", content: "Ravdesk Escrow - Secure Multi-Party Contracts" },
    { property: "og:description", content: "Revolutionary blockchain escrow platform for secure payments" },
    { property: "og:image", content: `https://placehold.co/1145x600/png?text=Ravdesk+Escrow` },
    { property: "og:type", content: "website" },
    
    // Farcaster Frame meta tags (vNext)
    { name: "fc:frame", content: "vNext" },
    { name: "fc:frame:image", content: `https://placehold.co/1145x600/png?text=Ravdesk+Escrow` },
    { name: "fc:frame:image:aspect_ratio", content: "1.91:1" },
    { name: "fc:frame:post_url", content: `${baseUrl}/api/frame` },
    { name: "fc:frame:button:1", content: "🏦 Create Escrow" },
    { name: "fc:frame:button:1:action", content: "post" },
    { name: "fc:frame:button:2", content: "📊 My Contracts" },
    { name: "fc:frame:button:2:action", content: "post" },
    
    // Farcaster Miniapp embed
    { name: "fc:miniapp", content: JSON.stringify({
      version: "1",
      imageUrl: `https://placehold.co/600x400/png?text=Ravdesk+Miniapp`,
      button: {
        title: "Launch Ravdesk Escrow",
        action: { type: "launch_miniapp" }
      }
    })}
  ];
  
  return metaTags;
};

// State management for frame navigation
export const FRAME_STATES = {
  HOME: 'home',
  CONTRACTS: 'contracts',
  CREATE: 'create',
  DEPOSIT: 'deposit',
  COMPLETE: 'complete'
} as const;

// Button actions mapping
export const BUTTON_ACTIONS = {
  create_contract: FRAME_STATES.CREATE,
  view_contracts: FRAME_STATES.CONTRACTS,
  deposit_funds: FRAME_STATES.DEPOSIT,
  complete_milestone: FRAME_STATES.COMPLETE,
  back_home: FRAME_STATES.HOME
} as const;
