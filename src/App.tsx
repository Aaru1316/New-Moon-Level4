import { useAuctionNetwork } from './hooks/useAuctionNetwork';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { StatusBanner } from './components/StatusBanner';
import { AuctionLotsView } from './components/AuctionLotsView';
import { ZKProofStudioView } from './components/ZKProofStudioView';
import { EscrowVaultView } from './components/EscrowVaultView';
import { LedgerExplorerView } from './components/LedgerExplorerView';
import { GovernanceAuditView } from './components/GovernanceAuditView';
import { Footer } from './components/Footer';

export default function App() {
  const {
    wallets,
    activeWallet,
    contractState,
    activeTab,
    setActiveTab,
    selectedLotId,
    bidAmount,
    setBidAmount,
    secretSalt,
    setSecretSalt,
    copySuccess,
    statusMessage,
    setStatusMessage,
    proofLog,
    adversaryMode,
    setAdversaryMode,
    fakeAmount,
    setFakeAmount,
    timeLeft,
    currentLot,
    computedCommitment,
    computedNullifier,
    handleWalletSwitch,
    handleSelectLot,
    handleCopySalt,
    handleSubmitBid,
    handleCloseAuction,
    handleRevealAndVerify,
    handleSettleEscrow,
    handleCastVote
  } = useAuctionNetwork();

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#070913]/90 backdrop-blur-xl">
        <Header
          wallets={wallets}
          activeWallet={activeWallet}
          contractState={contractState}
          timeLeft={timeLeft}
          onWalletSwitch={handleWalletSwitch}
        />
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          contractState={contractState}
        />
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusBanner
          statusMessage={statusMessage}
          onDismiss={() => setStatusMessage(null)}
        />

        {activeTab === 'lots' && (
          <AuctionLotsView
            contractState={contractState}
            selectedLotId={selectedLotId}
            currentLot={currentLot}
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            secretSalt={secretSalt}
            setSecretSalt={setSecretSalt}
            copySuccess={copySuccess}
            computedCommitment={computedCommitment}
            computedNullifier={computedNullifier}
            adversaryMode={adversaryMode}
            setAdversaryMode={setAdversaryMode}
            fakeAmount={fakeAmount}
            setFakeAmount={setFakeAmount}
            onSelectLot={handleSelectLot}
            onCopySalt={handleCopySalt}
            onSubmitBid={handleSubmitBid}
            onCloseAuction={handleCloseAuction}
            onRevealAndVerify={handleRevealAndVerify}
            onSettleEscrow={handleSettleEscrow}
          />
        )}

        {activeTab === 'proof_studio' && (
          <ZKProofStudioView proofLog={proofLog} />
        )}

        {activeTab === 'escrow' && (
          <EscrowVaultView contractState={contractState} />
        )}

        {activeTab === 'explorer' && (
          <LedgerExplorerView contractState={contractState} />
        )}

        {activeTab === 'audit' && (
          <GovernanceAuditView
            contractState={contractState}
            onCastVote={handleCastVote}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
