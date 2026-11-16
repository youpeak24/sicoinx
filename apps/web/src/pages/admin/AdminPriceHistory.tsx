import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Download, Upload, Edit, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminPriceHistory: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<any | null>(null);
  const [correctedPrice, setCorrectedPrice] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionStatus, setCorrectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importReport, setImportReport] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchRecords = () => {
    setIsLoading(true);
    api
      .get<{ records: any[]; totalCount: number }>(`/coin/price/history?range=ALL&limit=50&page=${page}`)
      .then((data) => {
        setRecords(data.records || []);
        setTotalCount(data.totalCount || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const handleOpenCorrection = (record: any) => {
    setCorrectionTarget(record);
    setCorrectedPrice(record.priceUsd);
    setCorrectionReason('');
    setCorrectionStatus('idle');
  };

  const handleExecuteCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget) return;

    setCorrectionStatus('loading');
    try {
      await api.post('/admin/pricing/correct-record', {
        recordId: correctionTarget.id,
        correctedPriceUsd: parseFloat(correctedPrice).toFixed(6),
        effectiveTimestamp: correctionTarget.effectiveTimestamp,
        reason: correctionReason,
      });

      setCorrectionStatus('success');
      setTimeout(() => {
        setCorrectionTarget(null);
        fetchRecords();
      }, 1200);
    } catch (err: any) {
      setCorrectionStatus('error');
      alert(err.message || 'Correction failed.');
    }
  };

  const handlePreviewImport = async () => {
    setIsImporting(true);
    try {
      const res = await api.post('/admin/pricing/import-csv', {
        csvContent: csvText,
        dryRun: true,
      });
      setImportReport(res);
    } catch (err: any) {
      alert(err.message || 'Import validation failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    try {
      const res = await api.post('/admin/pricing/import-csv', {
        csvContent: csvText,
        dryRun: false,
      });
      alert(res.message || 'CSV imported successfully!');
      setIsImportModalOpen(false);
      setCsvText('');
      setImportReport(null);
      fetchRecords();
    } catch (err: any) {
      alert(err.message || 'Import execution failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">Historical Price Telemetry</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable snapshot observations with provenance metadata and audited correction records
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <a
            href="/api/v1/admin/pricing/export-csv"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DFE8F5] bg-white text-xs font-semibold text-[#10213A] hover:bg-[#F7FAFF] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A] shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#DFE8F5] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#10213A]">Observation Snapshots ({totalCount})</h2>
            <p className="text-xs text-[#64748B]">Observations cannot be deleted; corrections preserve parent provenance</p>
          </div>
          <button onClick={fetchRecords} className="p-2 rounded-xl border border-[#DFE8F5] text-[#64748B] hover:text-[#175CFF]">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAFF] text-[#64748B] border-b border-[#DFE8F5]">
              <tr>
                <th className="p-4 font-semibold">Timestamp (UTC/Local)</th>
                <th className="p-4 font-semibold">Price (USD)</th>
                <th className="p-4 font-semibold">Source Label</th>
                <th className="p-4 font-semibold">Audit Justification</th>
                <th className="p-4 font-semibold">Actor</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE8F5]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7FAFF]/50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-[#10213A]">
                    {new Date(r.effectiveTimestamp).toLocaleString()}
                    {r.isCorrection && (
                      <span className="block text-[10px] font-bold text-amber-700">
                        Correction of #{r.supersededRecordId?.slice(0, 8)}...
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-[#175CFF] tabular-nums whitespace-nowrap text-sm">
                    ${r.priceUsd}
                  </td>
                  <td className="p-4 text-[#64748B]">
                    <span className="inline-flex items-center gap-1">
                      {r.sourceLabel}
                      {r.isDemoData && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          Demo
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B] max-w-xs truncate">{r.changeReason || '—'}</td>
                  <td className="p-4 text-[#64748B] whitespace-nowrap">{r.actorEmail || 'System'}</td>
                  <td className="p-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenCorrection(r)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#175CFF] hover:underline"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Correct Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Audited Record Correction */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">Correct Historical Price Observation</h3>
              <p className="text-xs text-[#64748B]">
                Revises observation #{correctionTarget.id.slice(0, 8)}... while preserving provenance history
              </p>
            </div>

            {correctionStatus === 'success' ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" />
                <h4 className="font-bold text-base text-[#10213A]">Record Corrected with Preserved Audit Trail</h4>
              </div>
            ) : (
              <form onSubmit={handleExecuteCorrection} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Corrected Price (USD)
                  </label>
                  <input
                    type="text"
                    required
                    value={correctedPrice}
                    onChange={(e) => setCorrectedPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10213A] mb-1">
                    Audited Justification (Mandatory Reasoning)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Describe reason for correction (e.g. data-entry transposition error confirmed against node logs)..."
                    className="w-full text-xs p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCorrectionTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={correctionStatus === 'loading'}
                    className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                  >
                    {correctionStatus === 'loading' ? 'Saving correction...' : 'Save Audited Correction'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: CSV Import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="border-b border-[#DFE8F5] pb-4">
              <h3 className="text-lg font-bold text-[#10213A]">Import Historical Price CSV</h3>
              <p className="text-xs text-[#64748B]">
                Expected columns: priceUsd, effectiveTimestamp, quoteCurrency, sourceLabel, changeReason
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`priceUsd,effectiveTimestamp,quoteCurrency,sourceLabel,changeReason\n1.100000,2026-09-01T00:00:00Z,USD,Historical Baseline,Genesis snapshot`}
                className="w-full text-xs font-mono p-3 rounded-xl border border-[#DFE8F5] bg-[#F7FAFF] focus:bg-white focus:border-[#175CFF]"
              />

              {importReport && (
                <div className="p-4 bg-[#EDF4FF] rounded-2xl text-xs space-y-2 border border-[#DFE8F5]">
                  <span className="font-bold text-[#123B9A] block">Import Validation Report</span>
                  <div className="flex gap-4">
                    <span>Total Rows: {importReport.summary.totalRowsInFile}</span>
                    <span className="text-[#15803D] font-bold">Valid: {importReport.summary.validRowsCount}</span>
                    <span className="text-[#DC2626] font-bold">Errors: {importReport.summary.errorsCount}</span>
                  </div>
                  {importReport.errors?.length > 0 && (
                    <ul className="text-red-600 list-disc pl-4 space-y-0.5">
                      {importReport.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportReport(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B]"
              >
                Close
              </button>
              {!importReport ? (
                <button
                  type="button"
                  onClick={handlePreviewImport}
                  disabled={!csvText.trim() || isImporting}
                  className="px-4 py-2 rounded-xl bg-[#EDF4FF] text-[#123B9A] text-xs font-semibold border border-[#DFE8F5] hover:bg-[#DFE8F5]"
                >
                  {isImporting ? 'Validating...' : 'Preview & Validate'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importReport.summary.validRowsCount === 0 || isImporting}
                  className="px-5 py-2.5 rounded-xl bg-[#175CFF] text-white text-xs font-semibold hover:bg-[#123B9A]"
                >
                  {isImporting ? 'Importing...' : `Import ${importReport.summary.validRowsCount} Records`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
