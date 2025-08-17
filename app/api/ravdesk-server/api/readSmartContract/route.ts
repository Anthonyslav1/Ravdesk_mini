import { NextRequest, NextResponse } from 'next/server';
import Web3 from 'web3';
import ABI from '@/ABI.json';

export const runtime = 'nodejs';

function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || 'https://mainnet.base.org';
}

function getWeb3(): Web3 {
  const g = global as any;
  if (!g.__RAVDESK_WEB3__) {
    g.__RAVDESK_WEB3__ = new Web3(getRpcUrl());
  }
  return g.__RAVDESK_WEB3__ as Web3;
}

function safeFromWei(web3: Web3, value: any, fallback = '0') {
  try {
    const str = value !== undefined && value !== null ? String(value) : '';
    if (!str) return fallback;
    return web3.utils.fromWei(str, 'ether');
  } catch {
    return fallback;
  }
}

async function fetchAgreement(web3: Web3, contract: any, address: string) {
  try {
    return await contract.methods.agreement().call();
  } catch (error) {
    // Fallback to raw eth_call with ABI encoding/decoding
    try {
      const data = contract.methods.agreement().encodeABI();
      const raw = await web3.eth.call({ to: address, data });
      const decoded = web3.eth.abi.decodeParameters(
        [
          { type: 'address[]', name: 'clients' },
          { type: 'address[]', name: 'freelancers' },
          { type: 'uint256', name: 'totalAmount' },
          { type: 'uint256', name: 'milestoneCount' },
          { type: 'uint256', name: 'currentMilestone' },
          { type: 'bool', name: 'isActive' },
          { type: 'bool', name: 'isCancelled' },
          { type: 'bool', name: 'isTimeLock' },
          { type: 'uint256', name: 'releaseTime' },
          { type: 'uint256', name: 'depositedAmount' },
          { type: 'uint256', name: 'netAmount' },
        ],
        raw
      );
      return decoded as any;
    } catch (e) {
      throw error;
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  const web3 = getWeb3();

  if (!address || !web3.utils.isAddress(address)) {
    return NextResponse.json({ error: 'Invalid or missing contract address' }, { status: 400 });
  }

  try {
    const code = await web3.eth.getCode(address);
    if (!code || code === '0x') {
      return NextResponse.json({ error: 'No contract deployed at the given address' }, { status: 404 });
    }

    const contract = new web3.eth.Contract(ABI as any, address);
    const agreement: any = await fetchAgreement(web3, contract, address);

    const milestones: Array<{ amount: string; description: string; isCompleted: boolean; isReleased: boolean }> = [];
    if (!agreement.isTimeLock) {
      const count = Number(agreement.milestoneCount);
      for (let i = 0; i < count; i++) {
        try {
          const m = (await contract.methods.getMilestone(i).call()) as {
            amount: string | number;
            description?: string;
            isCompleted: boolean;
            isReleased: boolean;
          };
          milestones.push({
            amount: safeFromWei(web3, m.amount),
            description: m.description || `Milestone ${i + 1}`,
            isCompleted: Boolean(m.isCompleted),
            isReleased: Boolean(m.isReleased),
          });
        } catch (e) {
          // continue without this milestone
        }
      }
    }

    const body = {
      clients: agreement.clients,
      freelancers: agreement.freelancers,
      totalAmount: safeFromWei(web3, agreement.totalAmount),
      netAmount: safeFromWei(web3, (agreement as any).netAmount),
      milestoneCount: Number(agreement.milestoneCount),
      currentMilestone: Number(agreement.currentMilestone),
      isActive: Boolean(agreement.isActive),
      isCancelled: Boolean(agreement.isCancelled),
      isTimeLock: Boolean(agreement.isTimeLock),
      releaseTime: Number(agreement.releaseTime),
      depositedAmount: safeFromWei(web3, agreement.depositedAmount),
      milestones,
    };

    return NextResponse.json(body);
  } catch (error: any) {
    console.error('GET /api/readSmartContract error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
