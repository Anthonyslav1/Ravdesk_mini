import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDbIfNeeded, toJSONStringArrayOrDefault } from '@/lib/db';

export const runtime = 'nodejs';

// Shape of a row in the `contracts` table (aligned with your Express server)
interface ContractRow {
  id: number;
  address: string;
  creator: string;
  role?: string | null;
  total_amount?: string | null;
  net_amount?: string | null;
  milestone_amounts?: string | null;
  clients: string; // JSON string in DB
  freelancers: string; // JSON string in DB
  freelancer_percentages: string; // JSON string in DB
  is_timelock?: number | boolean | null;
  release_time?: string | number | null;
  created_at?: string | null;
}

function parseJSONSafe<T>(input: string | null | undefined, fallback: T): T {
  if (!input) return fallback;
  try { return JSON.parse(input); } catch { return fallback; }
}

export async function POST(req: NextRequest) {
  await initDbIfNeeded();
  const pool = getPool();

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    address,
    creator,
    role = null,
    total_amount = null,
    net_amount = null,
    milestone_amounts = [],
    clients = [],
    freelancers = [],
    freelancer_percentages = [],
    is_timelock = false,
    release_time = null,
  } = payload || {};

  if (!address || !creator) {
    return NextResponse.json(
      { error: 'address and creator are required' },
      { status: 400 }
    );
  }

  try {
    const sql = `
      INSERT INTO contracts (
        address, creator, role, total_amount, net_amount, milestone_amounts,
        clients, freelancers, freelancer_percentages, is_timelock, release_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      String(address),
      String(creator),
      role ? String(role) : null,
      total_amount != null ? String(total_amount) : null,
      net_amount != null ? String(net_amount) : null,
      toJSONStringArrayOrDefault(milestone_amounts),
      toJSONStringArrayOrDefault(clients),
      toJSONStringArrayOrDefault(freelancers),
      toJSONStringArrayOrDefault(freelancer_percentages),
      Boolean(is_timelock) ? 1 : 0,
      release_time != null ? String(release_time) : null,
    ];

    const [result] = await pool.execute(sql, params as any);
    return NextResponse.json(
      { message: 'Contract saved', address, insertId: (result as any)?.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/contracts insert error:', error);
    return NextResponse.json(
      { error: 'Failed to save contract', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await initDbIfNeeded();
  const pool = getPool();
  const { searchParams } = new URL(req.url);
  const creator = searchParams.get('creator');

  try {
    let rows: ContractRow[] = [];

    if (creator) {
      const sql = `
        SELECT id, address, creator, role, total_amount, net_amount, milestone_amounts,
               clients, freelancers, freelancer_percentages, is_timelock, release_time, created_at
        FROM contracts
        WHERE creator = ?
           OR JSON_CONTAINS(clients, JSON_QUOTE(?))
           OR JSON_CONTAINS(freelancers, JSON_QUOTE(?))
      `;
      try {
        const [result] = await pool.execute(sql, [creator, creator, creator]);
        rows = result as ContractRow[];
      } catch (e) {
        // Fallback: some setups store JSON as TEXT; do a broad fetch and filter in JS
        const [all] = await pool.query(
          `SELECT id, address, creator, role, total_amount, net_amount, milestone_amounts,
                  clients, freelancers, freelancer_percentages, is_timelock, release_time, created_at
           FROM contracts`
        );
        const allRows = all as ContractRow[];
        const lc = creator.toLowerCase();
        rows = allRows.filter((r) => {
          const clients = parseJSONSafe<string[]>(r.clients, []);
          const freelancers = parseJSONSafe<string[]>(r.freelancers, []);
          return (
            r.creator?.toLowerCase() === lc ||
            clients.some((c) => c?.toLowerCase?.() === lc) ||
            freelancers.some((f) => f?.toLowerCase?.() === lc)
          );
        });
      }
    } else {
      const [result] = await pool.query(
        `SELECT id, address, creator, role, total_amount, net_amount, milestone_amounts,
                clients, freelancers, freelancer_percentages, is_timelock, release_time, created_at
         FROM contracts`
      );
      rows = result as ContractRow[];
    }

    const formatted = rows.map((row) => ({
      ...row,
      clients: parseJSONSafe<string[]>(row.clients, []),
      freelancers: parseJSONSafe<string[]>(row.freelancers, []),
      // Keep as JSON string; Dashboard calls safeJSONParse on this field
      freelancer_percentages: row.freelancer_percentages ?? '[]',
      milestone_amounts: row.milestone_amounts ? parseJSONSafe<string[]>(row.milestone_amounts, []) : [],
      is_timelock: Boolean(row.is_timelock),
      release_time: row.release_time ? String(row.release_time) : null,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('GET /api/contracts error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
