# Ravdesk Farcaster Mini App Setup

## Quick Setup for Hackathon

1. **Create a `.env.local` file** in the Ravdesk directory with these values:

```bash
# OnchainKit Configuration (Required for Farcaster)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Ravdesk Escrow
NEXT_PUBLIC_ICON_URL=https://i.imgur.com/hNYVXLV.png

# Contract Configuration (Placeholder for now)
# Replace this with your actual contract after deploying via Remix
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Base Network RPC (Using public endpoint)
NEXT_PUBLIC_RPC_URL=https://base.blockpi.network/v1/rpc/public
```

## Getting Your OnchainKit API Key

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Sign up or log in with your Coinbase account
3. Create a new project for "Ravdesk Escrow"
4. Copy your API key and paste it in the `.env.local` file

## Deploying Your Contract (Later via Remix)

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Deploy the `RavdeskEscrowSecure.sol` contract to Base network
3. Replace the placeholder address in `.env.local` with your deployed contract address

## Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Farcaster mini app!

## Testing in Farcaster

1. Your app includes Farcaster Frame metadata for sharing
2. MiniKit integration is ready for in-app functionality
3. The app will work within Warpcast's mini app viewer

## Important Notes

- The placeholder contract address (`0x1234...7890`) is used for demo purposes
- Replace it with your actual deployed contract address before the hackathon presentation
- The app is configured for Base mainnet by default
- All Farcaster meta tags and MiniKit providers are properly configured
