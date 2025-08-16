# Environment Variables Template

Create a `.env.local` file in the root of the Ravdesk directory with these variables:

```bash
# OnchainKit Configuration (Required)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Ravdesk Escrow
NEXT_PUBLIC_ICON_URL=https://your-domain.com/icon.png

# Contract Configuration (Required for Web3 functionality)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Optional RPC (recommended for reliability)
# A public Base RPC can be used for testing, or set your own provider URL
NEXT_PUBLIC_RPC_URL=https://base.blockpi.network/v1/rpc/public
```

## Getting your OnchainKit API Key

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Sign up or log in
3. Create a new project
4. Copy your API key

## Deploy your smart contract

1. Navigate to the `contract` directory
2. Run `forge script --help` to see deployment options
3. Deploy `RavdeskEscrowSecure.sol` to Base testnet or mainnet
4. Update `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` with your deployed contract address

## For Vercel Deployment

Add these same environment variables in your Vercel Project Settings under "Environment Variables".
