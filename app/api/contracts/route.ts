import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// In-memory storage for demonstration (replace with database in production)
const contracts: Array<{
  id: string;
  address: string;
  creator: string;
  role: string;
  created_at: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const { address, creator, role } = await req.json();
    
    if (!address || !creator || !role) {
      return NextResponse.json(
        { error: 'Address, creator, and role are required' },
        { status: 400 }
      );
    }

    const newContract = {
      id: Math.random().toString(36).substring(7),
      address,
      creator,
      role,
      created_at: new Date().toISOString(),
    };

    contracts.push(newContract);

    return NextResponse.json(
      { message: 'Contract saved', address, id: newContract.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving contract:', error);
    return NextResponse.json(
      { error: 'Failed to save contract' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creator = searchParams.get('creator');

    if (creator) {
      const userContracts = contracts.filter(c => c.creator === creator);
      return NextResponse.json(userContracts);
    }

    // Return all contracts if no creator specified
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}
