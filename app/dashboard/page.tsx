'use client';

import dynamic from 'next/dynamic';
import '../../lib/axios-proxy';
const DashboardLegacy = dynamic(() => import('../../components/Dashboard.jsx'), { ssr: false });

type EscrowUIContract = {
  id: string;
  title: string;
  status: string;
  isTimeLock: boolean;
  totalAmount: string;
  clients: string[];
  freelancers: string[];
  milestones: Array<{ title: string; description?: string; isCompleted?: boolean; amount?: string }>;
  currentMilestone: number;
  needsDeposit: boolean;
  canComplete: boolean;
  canApprove: boolean;
  canWithdraw: boolean;
  canCancel: boolean;
  createdAt?: string;
};

export default function DashboardPage() {
  // Bridge: render the legacy Dashboard page from the original project
  return (
    <div className="miniapp-bridge">
      <DashboardLegacy />
      <style jsx global>{`
        .miniapp-bridge nav, .miniapp-bridge footer { display: none !important; }
      `}</style>
    </div>
  );
  /*
  const { isConnected } = useAccount();

  // Read hooks
  const { data: contractState } = useContractState();
  const { data: totalAmount } = useTotalAmount();
  const { data: currentMilestone } = useCurrentMilestone();
  const { data: milestoneCount } = useMilestoneCount();
  const { data: isTimeLock } = useIsTimeLock();

  // Write hooks
  const { deposit } = useDeposit();
  const { completeMilestone } = useCompleteMilestone();
  const { cancelContract } = useCancelContract();
  const { timeLockRelease } = useTimeLockRelease();

  const [contracts, setContracts] = useState<EscrowUIContract[]>([]);

  // Derive a single on-chain contract into the UI model
  const derived: EscrowUIContract | null = useMemo(() => {
    if (!isConnected) return null;

    const cm = Number(currentMilestone ?? 0);
    const mc = Number(milestoneCount ?? 0);
    const rawStateLabel = getContractStateLabel(
      typeof contractState === 'number' ? contractState : Number(contractState)
    );
    // Map to EscrowCard vocabulary (expects 'completed')
    const stateLabel = rawStateLabel === 'Complete' ? 'Completed' : rawStateLabel;

    const steps = Array.from({ length: Math.max(mc, 0) }).map((_, i) => ({
      title: `Milestone ${i + 1}`,
      description: i < cm ? 'Completed' : i === cm ? 'In progress' : 'Pending',
      isCompleted: i < cm,
    }));

    return {
      id: RAVDESK_ESCROW_ADDRESS,
      title: 'Ravdesk Escrow Contract',
      status: stateLabel,
      isTimeLock: Boolean(isTimeLock),
      totalAmount: formatContractAmount(totalAmount as unknown as bigint | undefined),
      clients: [],
      freelancers: [],
      milestones: steps,
      currentMilestone: cm,
      needsDeposit: true,
      canComplete: mc > 0 && cm < mc && stateLabel === 'Active' && !Boolean(isTimeLock),
      canApprove: false,
      canWithdraw: Boolean(isTimeLock) && stateLabel === 'Active',
      canCancel: stateLabel === 'Active',
      createdAt: new Date().toISOString(),
    };
  }, [isConnected, contractState, totalAmount, currentMilestone, milestoneCount, isTimeLock]);

  useEffect(() => {
    if (derived) {
      setContracts([derived]);
    } else {
      // Fallback sample for disconnected state
      setContracts([
        {
          id: '0x1234...abcd',
          title: 'Sample Escrow Contract',
          status: 'Active',
          isTimeLock: false,
          totalAmount: '0.05',
          clients: [],
          freelancers: [],
          milestones: [
            { title: 'Milestone 1', description: 'Completed', isCompleted: true },
            { title: 'Milestone 2', description: 'In progress', isCompleted: false },
            { title: 'Milestone 3', description: 'Pending', isCompleted: false },
          ],
          currentMilestone: 1,
          needsDeposit: false,
          canComplete: true,
          canApprove: false,
          canWithdraw: false,
          canCancel: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [derived]);

  // Action handlers mapped to write hooks
  const handleDeposit = async (_id: string) => {
    try {
      await deposit('0.01');
    } catch (e) {
      console.error('Deposit failed', e);
    }
  };

  const handleComplete = async (_id: string) => {
    try {
      const cm = Number(currentMilestone ?? 0);
      await completeMilestone(cm);
    } catch (e) {
      console.error('Complete milestone failed', e);
    }
  };

  const handleCancel = async (_id: string) => {
    try {
      await cancelContract();
    } catch (e) {
      console.error('Cancel contract failed', e);
    }
  };

  const handleWithdraw = async (_id: string) => {
    try {
      await timeLockRelease();
    } catch (e) {
      console.error('Withdraw (timelock release) failed', e);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Live view of your escrow contract and actions.</p>
      </div>

      <div className="grid gap-4">
        {contracts.map((c) => (
          <EscrowCard
            key={c.id}
            contract={c as any}
            onDeposit={handleDeposit}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onWithdraw={handleWithdraw}
          />
        ))}
      </div>
    </main>
  );
  */
}
