import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  Lock,
  Unlock,
  Shield,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  HardDrive,
  Copy,
  Check,
  FileCheck,
  ExternalLink,
  Layers,
  Key,
  Database
} from 'lucide-react';
import { SealedBidAuctionState, ManagedFolder, ManagedFile } from '../../types/ledger';

interface ManagedFolderViewProps {
  contractState: SealedBidAuctionState;
  activeWalletAddress?: string;
  onCreateFolder: (folderData: {
    name: string;
    description: string;
    associatedLotId?: string;
    category: ManagedFolder['category'];
    accessPolicy: ManagedFolder['accessPolicy'];
    isLocked: boolean;
    createdBy: string;
  }) => void;
  onAddFile: (folderId: string, fileData: {
    name: string;
    sizeBytes: number;
    fileType: string;
    poseidonHash: string;
    ipfsCid: string;
    privacyLevel: ManagedFile['privacyLevel'];
  }) => void;
  onToggleLock: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export const ManagedFolderView: React.FC<ManagedFolderViewProps> = ({
  contractState,
  activeWalletAddress = '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b',
  onCreateFolder,
  onAddFile,
  onToggleLock,
  onDeleteFolder
}) => {
  const folders = contractState.managedFolders || [];
  const [selectedFolderId, setSelectedFolderId] = useState<string>(folders[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAddFileModal, setShowAddFileModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Folder Form State
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState<ManagedFolder['category']>('NFT Assets');
  const [newFolderLotId, setNewFolderLotId] = useState<string>('lot-1');
  const [newFolderPolicy, setNewFolderPolicy] = useState<ManagedFolder['accessPolicy']>('Winner Only');

  // New File Form State
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('application/json');
  const [newFileSize, setNewFileSize] = useState<number>(10240);
  const [newFilePrivacy, setNewFilePrivacy] = useState<ManagedFile['privacyLevel']>('encrypted');

  const selectedFolder = folders.find(f => f.id === selectedFolderId) || folders[0];

  // Stats calculation
  const totalFiles = folders.reduce((sum, f) => sum + (f.files?.length || 0), 0);
  const totalSizeBytes = folders.reduce(
    (sum, f) => sum + (f.files?.reduce((fSum, file) => fSum + file.sizeBytes, 0) || 0),
    0
  );
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  const handleCopyHash = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    onCreateFolder({
      name: newFolderName.trim(),
      description: newFolderDesc.trim() || 'Managed ZK confidential asset folder',
      associatedLotId: newFolderLotId,
      category: newFolderCategory,
      accessPolicy: newFolderPolicy,
      isLocked: false,
      createdBy: activeWalletAddress
    });

    setNewFolderName('');
    setNewFolderDesc('');
    setShowCreateModal(false);
  };

  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId || !newFileName.trim()) return;

    const randomHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const randomCid = 'bafybei' + Array.from({ length: 28 }, () => Math.floor(Math.random() * 36).toString(36)).join('');

    onAddFile(selectedFolderId, {
      name: newFileName.trim(),
      sizeBytes: newFileSize,
      fileType: newFileType,
      poseidonHash: randomHash,
      ipfsCid: randomCid,
      privacyLevel: newFilePrivacy
    });

    setNewFileName('');
    setShowAddFileModal(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-[#070913] space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0d1527] via-[#0b1b36] to-[#0d1527] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  Managed Asset Folders & Confidential Proof Storage
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active Vault
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organize, manage, and verify encrypted asset files, zero-knowledge credentials, and lot proofs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Managed Folder</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              Total Managed Folders
            </div>
            <div className="text-lg font-bold text-white mt-1">{folders.length}</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Encrypted Files
            </div>
            <div className="text-lg font-bold text-white mt-1">{totalFiles}</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              Total Vault Size
            </div>
            <div className="text-lg font-bold text-white mt-1">{totalSizeMB} MB</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Security Protocol
            </div>
            <div className="text-xs font-semibold text-emerald-400 mt-1.5">Poseidon + AES-256</div>
          </div>
        </div>
      </div>

      {/* Main Managed Folders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Folders List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Folder className="w-4 h-4 text-cyan-400" />
            Managed Folders Directory
          </h2>

          <div className="space-y-3">
            {folders.map(folder => {
              const isSelected = folder.id === (selectedFolder?.id || selectedFolderId);
              const fileCount = folder.files?.length || 0;
              const folderSize = formatBytes(
                folder.files?.reduce((sum, f) => sum + f.sizeBytes, 0) || 0
              );

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg border ${
                          folder.isLocked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        }`}
                      >
                        {folder.isLocked ? <Lock className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white line-clamp-1">{folder.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{folder.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {folder.category}
                      </span>
                      {folder.associatedLotId && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                          {folder.associatedLotId.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400 font-mono">
                      {fileCount} files • {folderSize}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Folder Detail & File Browser */}
        <div className="lg:col-span-2 space-y-4">
          {selectedFolder ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0b1021]/80 p-6 space-y-6">
              {/* Folder Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedFolder.name}</h2>
                      {selectedFolder.isLocked ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          <Unlock className="w-3 h-3" /> Editable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedFolder.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleLock(selectedFolder.id)}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
                    title={selectedFolder.isLocked ? 'Unlock Folder' : 'Lock Folder'}
                  >
                    {selectedFolder.isLocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                    <span>{selectedFolder.isLocked ? 'Unlock' : 'Lock'}</span>
                  </button>

                  <button
                    onClick={() => setShowAddFileModal(true)}
                    disabled={selectedFolder.isLocked}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedFolder.isLocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add File</span>
                  </button>

                  <button
                    onClick={() => onDeleteFolder(selectedFolder.id)}
                    className="p-2 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition-colors"
                    title="Delete Managed Folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Folder Properties */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Access Policy</span>
                  <span className="text-cyan-400 font-semibold mt-0.5 block">{selectedFolder.accessPolicy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Category</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">{selectedFolder.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Associated Lot</span>
                  <span className="text-purple-400 font-semibold mt-0.5 block">
                    {selectedFolder.associatedLotId ? selectedFolder.associatedLotId.toUpperCase() : 'Global Vault'}
                  </span>
                </div>
              </div>

              {/* Files Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Encrypted Folder Files ({selectedFolder.files?.length || 0})
                  </h3>
                </div>

                {(!selectedFolder.files || selectedFolder.files.length === 0) ? (
                  <div className="text-center py-10 rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">No files stored in this managed folder yet.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Click "Add File" to upload confidential metadata or proof files.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedFolder.files.map(file => (
                      <div
                        key={file.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white flex items-center gap-2">
                                {file.name}
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                                  {formatBytes(file.sizeBytes)}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>Type: {file.fileType}</span>
                                <span>•</span>
                                <span>Uploaded: {new Date(file.uploadedAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                file.privacyLevel === 'zk-proof'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : file.privacyLevel === 'encrypted'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {file.privacyLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Hash details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 truncate mr-2">Poseidon Hash:</span>
                            <button
                              onClick={() => handleCopyHash(file.poseidonHash, file.id + '-hash')}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                            >
                              <span className="truncate max-w-[120px]">{file.poseidonHash}</span>
                              {copiedId === file.id + '-hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 truncate mr-2">IPFS CID:</span>
                            <button
                              onClick={() => handleCopyHash(file.ipfsCid, file.id + '-cid')}
                              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[10px]"
                            >
                              <span className="truncate max-w-[120px]">{file.ipfsCid}</span>
                              {copiedId === file.id + '-cid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/30">
              <Folder className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-semibold">Select a managed folder from the directory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Folder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0d1326] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                Create New Managed Asset Folder
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lot #1 - Master Assets & Credentials"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of folder contents and privacy rules..."
                  value={newFolderDesc}
                  onChange={e => setNewFolderDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newFolderCategory}
                    onChange={e => setNewFolderCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="NFT Assets">NFT Assets</option>
                    <option value="Validator Keys">Validator Keys</option>
                    <option value="Protocol Credentials">Protocol Credentials</option>
                    <option value="Audit Receipts">Audit Receipts</option>
                    <option value="Custom Vault">Custom Vault</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Linked Lot</label>
                  <select
                    value={newFolderLotId}
                    onChange={e => setNewFolderLotId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {contractState.lots.map(lot => (
                      <option key={lot.lotId} value={lot.lotId}>
                        {lot.title} ({lot.lotId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Access Policy</label>
                <select
                  value={newFolderPolicy}
                  onChange={e => setNewFolderPolicy(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Winner Only">Winner Only (Restricted to verified ZK winner)</option>
                  <option value="Bidder Restricted">Bidder Restricted (Active bidders with locked escrow)</option>
                  <option value="Public Metadata">Public Metadata (Open view for all observers)</option>
                  <option value="Vault Admin">Vault Admin (Auctioneer strictly)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add File */}
      {showAddFileModal && selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#0d1326] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add File to [{selectedFolder.name}]
              </h3>
              <button
                onClick={() => setShowAddFileModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">File Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. proof_manifest.json or asset_key.pem"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MIME File Type</label>
                  <input
                    type="text"
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Size (Bytes)</label>
                  <input
                    type="number"
                    value={newFileSize}
                    onChange={e => setNewFileSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Privacy Level</label>
                <select
                  value={newFilePrivacy}
                  onChange={e => setNewFilePrivacy(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="encrypted">Encrypted (AES-256 + Poseidon Commitment)</option>
                  <option value="zk-proof">ZK-Proof Payload (Nullifier & Range Proof file)</option>
                  <option value="public">Public (Unencrypted metadata document)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddFileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-semibold text-xs transition-all shadow-lg shadow-purple-500/20"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
