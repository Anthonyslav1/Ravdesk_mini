// Farcaster Miniapp Configuration
export const FARCASTER_CONFIG = {
  // Miniapp metadata
  version: "1",
  name: "Ravdesk Escrow",
  description: "Secure multi-party escrow contracts on blockchain",
  imageUrl: "/farcaster-frame.png", // 3:2 aspect ratio image
  
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
    imageUrl: "/farcaster-frame.png",
    button: {
      title: "Launch Ravdesk Escrow",
      action: {
        type: "launch_miniapp"
      }
    }
  }
};

// Generate meta tags for Farcaster frame
export const generateFrameMetaTags = (currentState = "home") => {
  const baseUrl = process.env.VITE_APP_URL || "http://localhost:5173";
  
  const metaTags = [
    // OpenGraph fallback
    { property: "og:title", content: "Ravdesk Escrow - Secure Multi-Party Contracts" },
    { property: "og:description", content: "Revolutionary blockchain escrow platform for secure payments" },
    { property: "og:image", content: `${baseUrl}/farcaster-frame.png` },
    
    // Farcaster frame tags
    { name: "fc:frame", content: "vNext" },
    { name: "fc:frame:image", content: `${baseUrl}/farcaster-frame.png` },
    { name: "fc:frame:image:aspect_ratio", content: "1.91:1" },
    { name: "fc:frame:post_url", content: `${baseUrl}/api/frame` },
    
    // Farcaster miniapp embed
    { name: "fc:miniapp", content: JSON.stringify(FARCASTER_CONFIG.embed) },
    
    // Frame buttons based on current state
    ...generateFrameButtons(currentState)
  ];
  
  return metaTags;
};

const generateFrameButtons = (state) => {
  const buttons = [];
  
  switch (state) {
    case "home":
      buttons.push(
        { name: "fc:frame:button:1", content: "🏦 Create Escrow" },
        { name: "fc:frame:button:1:action", content: "post" },
        { name: "fc:frame:button:2", content: "📊 My Contracts" },
        { name: "fc:frame:button:2:action", content: "post" }
      );
      break;
      
    case "contracts":
      buttons.push(
        { name: "fc:frame:button:1", content: "⬅️ Back" },
        { name: "fc:frame:button:1:action", content: "post" },
        { name: "fc:frame:button:2", content: "💰 Deposit" },
        { name: "fc:frame:button:2:action", content: "post" },
        { name: "fc:frame:button:3", content: "✅ Complete" },
        { name: "fc:frame:button:3:action", content: "post" }
      );
      break;
      
    case "create":
      buttons.push(
        { name: "fc:frame:button:1", content: "⬅️ Back" },
        { name: "fc:frame:button:1:action", content: "post" },
        { name: "fc:frame:button:2", content: "💼 Milestone Mode" },
        { name: "fc:frame:button:2:action", content: "post" },
        { name: "fc:frame:button:3", content: "⏰ Timelock Mode" },
        { name: "fc:frame:button:3:action", content: "post" }
      );
      break;
      
    default:
      buttons.push(
        { name: "fc:frame:button:1", content: "🏠 Home" },
        { name: "fc:frame:button:1:action", content: "post" }
      );
  }
  
  return buttons;
};

export default FARCASTER_CONFIG;
