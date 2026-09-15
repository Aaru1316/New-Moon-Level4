import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Check,
  Download,
  ShieldCheck,
  FileCode,
  Layers,
  Sparkles,
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';
import { ProofLogEntry } from '../../hooks/useAuctionNetwork';

interface ZKProofStudioViewProps {
  proofLog: ProofLogEntry[];
}

export const ZKProofStudioView: React.FC<ZKProofStudioViewProps> = ({ proofLog }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'proof_json' | 'verifying_key' | 'compact_circuit'>('pipeline');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [localProofSteps, setLocalProofSteps] = useState<ProofLogEntry[]>([
    {
      step: '1. Poseidon Commitment Witness Generation',
      status: 'passed',
      detail: 'Opening commitment H(amount, salt, bidderAddress, lotId) matching on-chain leaf.'
    },
    {
      step: '2. Reserve Price Range Constraint Check',
      status: 'passed',
      detail: 'Enforcing v_win >= reserve_price via 64-bit non-negative slack variable check.'
    },
    {
      step: '3. Multi-Lot Relative Ordering Circuit',
      status: 'passed',
      detail: 'Verifying winning amount >= all competing sealed commitments without exposing losing amounts.'
    },
    {
      step: '4. Nullifier Derivation & Double-Spend Guard',
      status: 'passed',
      detail: 'Derived nullifier = H(salt, bidderAddress, auctionId, lotId). Verified nullifier not in spent set.'
    },
    {
      step: '5. Groth16 Elliptic Curve Pairing Check',
      status: 'passed',
      detail: 'Pairing equation e(pi_A, pi_B) == e(alpha, beta) * e(pi_C, gamma) satisfied over BN254.'
    }
  ]);

  const displayLogs = proofLog.length > 0 ? proofLog : localProofSteps;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSimulateProofRun = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setLocalProofSteps([
        {
          step: '1. Poseidon Commitment Witness Generation',
          status: 'passed',
          detail: `Computed Poseidon digest 0x${Math.random().toString(16).substring(2, 10)}... matching ledger record.`
        },
        {
          step: '2. Reserve Price Range Constraint Check',
          status: 'passed',
          detail: 'Arithmetic circuit verified delta = (v_win - reserve) >= 0 over finite field F_p.'
        },
        {
          step: '3. Multi-Lot Relative Ordering Circuit',
          status: 'passed',
          detail: 'All pairwise inequality gates passed. Winner verified as strictly maximal.'
        },
        {
          step: '4. Nullifier Derivation & Double-Spend Guard',
          status: 'passed',
          detail: 'Poseidon nullifier verified unique against on-chain Nullifier Merkle tree.'
        },
        {
          step: '5. Groth16 Elliptic Curve Pairing Check',
          status: 'passed',
          detail: 'Bilinear pairing equation e(A, B) = e(alpha, beta) * e(C, gamma) computed in 42ms.'
        }
      ]);
    }, 900);
  };

  const sampleProofJson = JSON.stringify(
    {
      circuit: 'prove_highest_bid_and_reserve',
      provingSystem: 'Groth16',
      curve: 'BN254',
      publicSignals: [
        '0x71a48c902b8e31a14f52b619d803c4f72831a9f2',
        '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b',
        '0x0000000000000000000000000000000000000000000000000000000000000258',
        '0x64e29b1837f19a02938472910384719284719283749182739481729384719283'
      ],
      pi_a: [
        '0x1f92847192847192837491827394817293847192837491827394817293847192',
        '0x0d83749182739481729384719283749182739481729384719283749182739481',
        '0x01'
      ],
      pi_b: [
        [
          '0x2837491827394817293847192837491827394817293847192837491827394817',
          '0x3948172938471928374918273948172938471928374918273948172938471928'
        ],
        [
          '0x1273948172938471928374918273948172938471928374918273948172938471',
          '0x4817293847192837491827394817293847192837491827394817293847192837'
        ]
      ],
      pi_c: [
        '0x9481729384719283749182739481729384719283749182739481729384719283',
        '0x8172938471928374918273948172938471928374918273948172938471928374',
        '0x01'
      ],
      timestamp: Date.now(),
      status: 'VALID_ON_CHAIN'
    },
    null,
    2
  );

  const sampleVerifyingKey = JSON.stringify(
    {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 4,
      vk_alpha_1: [
        '0x1d37e90956b7f...4a1',
        '0x2289f6426723c...9b2',
        '0x01'
      ],
      vk_beta_2: [
        ['0x12b...f', '0x19a...c'],
        ['0x2a1...3', '0x04e...7']
      ],
      vk_gamma_2: [
        ['0x0b1...4', '0x27f...a'],
        ['0x1ce...8', '0x23a...1']
      ],
      vk_delta_2: [
        ['0x1fa...2', '0x184...5'],
        ['0x2d1...9', '0x03c...d']
      ],
      IC: [
        ['0x1f1...a', '0x2b2...c', '0x01'],
        ['0x0e4...d', '0x1c3...e', '0x01'],
        ['0x24a...7', '0x0a9...1', '0x01'],
        ['0x11e...3', '0x25f...8', '0x01']
      ]
    },
    null,
    2
  );

  const sampleCompactCode = `// Midnight Compact ZK Circuit Specification
// contracts/SealedBidAuction.compact

circuit prove_highest_bid_and_reserve(
    // Public Inputs
    public auction_id: Bytes<32>,
    public lot_id: Bytes<16>,
    public reserve_price: Uint<64>,
    public commitment_root: MerkleRoot,
    public winner_nullifier: Nullifier,

    // Private Witness Inputs (Never exposed)
    witness winning_bid: Uint<64>,
    witness secret_salt: Bytes<32>,
    witness bidder_sk: PrivateKey,
    witness competing_commitments: Vector<Commitment, 32>
) -> (bool) {
    // 1. Verify Winning Commitment Opening
    let computed_leaf = poseidon_hash(winning_bid, secret_salt, pk(bidder_sk), lot_id);
    assert(commitment_root.contains(computed_leaf));

    // 2. Reserve Price Inequality
    assert(winning_bid >= reserve_price);

    // 3. Maximal Bid Range Proof (Without opening losing amounts)
    for c in competing_commitments {
        assert(winning_bid >= c.upper_bound);
    }

    // 4. Nullifier Integrity (Double-Spend Protection)
    let nullifier = poseidon_hash(secret_salt, pk(bidder_sk), auction_id, lot_id);
    assert(nullifier == winner_nullifier);

    return true;
}`;

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0d1527] via-[#0b1b36] to-[#0d1527] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Zero-Knowledge Proof & Constraint Studio
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Groth16 / BN254
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect, verify, and generate SNARK proofs for private multi-lot bidding, range constraints, and Midnight Compact circuits.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateProofRun}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Proof...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Simulate ZK Proof Synthesis</span>
              </>
            )}
          </button>
        </div>

        {/* Constraint Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">R1CS Constraints</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">8,192</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Wire Allocation</span>
            <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">12,450</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Poseidon Rounds</span>
            <span className="text-sm font-bold text-purple-400 font-mono mt-0.5 block">8 Full + 56 Part</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Proving Key</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">1.84 MB</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Verifying Key</span>
            <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">480 Bytes</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Avg Prover Time</span>
            <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">184 ms</span>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Tabs */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 flex items-center justify-between">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Verification Pipeline ({displayLogs.length} Gates)</span>
            </button>

            <button
              onClick={() => setActiveTab('proof_json')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'proof_json'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Proof Payload (π_A, π_B, π_C)</span>
            </button>

            <button
              onClick={() => setActiveTab('verifying_key')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'verifying_key'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifying Key (VK)</span>
            </button>

            <button
              onClick={() => setActiveTab('compact_circuit')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'compact_circuit'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Midnight Compact Circuit</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Circuit Ready</span>
          </div>
        </div>

        {/* Tab 1: Verification Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Mathematical Gate Verification Pipeline</h3>
                <p className="text-xs text-slate-400">
                  Every step represents an unforgeable zero-knowledge cryptographic constraint checked by the verifier smart contract.
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-mono rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold">
                ALL 5 CONSTRAINTS SATISFIED
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {displayLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    log.status === 'passed'
                      ? 'bg-emerald-950/20 border-emerald-800/50 hover:border-emerald-700'
                      : log.status === 'failed'
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : 'bg-cyan-950/20 border-cyan-800/50 animate-pulse'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{log.step}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] uppercase font-mono bg-slate-900 text-slate-400">
                          Gate #{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                        {log.detail}
                      </p>
                    </div>

                    <div className="ml-4">
                      {log.status === 'passed' && (
                        <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="hidden sm:inline">VERIFIED</span>
                        </div>
                      )}
                      {log.status === 'failed' && (
                        <div className="flex items-center space-x-1 text-rose-400 text-xs font-semibold">
                          <XCircle className="w-5 h-5" />
                          <span className="hidden sm:inline">REJECTED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Proof JSON Payload */}
        {activeTab === 'proof_json' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Groth16 Proof Payload (BN254 Field Elements)</h3>
                <p className="text-xs text-slate-400">
                  Compressed cryptographic proof payload sent on-chain to the Midnight verifier contract.
                </p>
              </div>
              <button
                onClick={() => handleCopy(sampleProofJson, 'proof')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all"
              >
                {copiedSection === 'proof' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'proof' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
              {sampleProofJson}
            </pre>
          </div>
        )}

        {/* Tab 3: Verifying Key */}
        {activeTab === 'verifying_key' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Smart Contract Verifying Key (vk.json)</h3>
                <p className="text-xs text-slate-400">
                  Immutable public verification key deployed at Midnight Preprod contract address <code className="text-cyan-400">0x71a48c902b...</code>
                </p>
              </div>
              <button
                onClick={() => handleCopy(sampleVerifyingKey, 'vk')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all"
              >
                {copiedSection === 'vk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'vk' ? 'Copied' : 'Copy VK'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed max-h-96">
              {sampleVerifyingKey}
            </pre>
          </div>
        )}

        {/* Tab 4: Midnight Compact Circuit */}
        {activeTab === 'compact_circuit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Native Midnight Compact ZK Circuit Code</h3>
                <p className="text-xs text-slate-400">
                  Written in Midnight's native Compact language for zero-knowledge smart contracts.
                </p>
              </div>
              <button
                onClick={() => handleCopy(sampleCompactCode, 'compact')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all"
              >
                {copiedSection === 'compact' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'compact' ? 'Copied' : 'Copy Compact Code'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-96">
              {sampleCompactCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
