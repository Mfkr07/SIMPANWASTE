"use client";

import { useState, useEffect } from "react";
import {
  HandCoins,
  Clock3,
  CheckCircle2,
  Search,
  UploadCloud,
  Download,
  LoaderCircle,
  Check,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  Field,
  Modal,
  InfoRow,
  StatCard,
  StatusDropdown,
  Pagination,
  usePagination,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/context/AdminContext";
import { WithdrawalRequest, money } from "@/data/wargaSeedData";

export default function AdminPermintaanPage() {
  const { withdrawalRequests, processWithdrawal, notify } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [detailRequest, setDetailRequest] = useState<WithdrawalRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState<WithdrawalRequest | null>(null);
  const [previewRequest, setPreviewRequest] = useState<WithdrawalRequest | null>(null);

  const [proofDraft, setProofDraft] = useState<{
    name: string;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [proofError, setProofError] = useState("");
  const [processing, setProcessing] = useState(false);

  const totalCount = withdrawalRequests.length;
  const pendingCount = withdrawalRequests.filter((w) => w.status === "Menunggu").length;
  const doneCount = withdrawalRequests.filter((w) => w.status === "Selesai").length;

  const filteredRequests = withdrawalRequests.filter((r) => {
    const matchesStatus =
      statusFilter === "Semua" ||
      r.status === statusFilter ||
      (statusFilter === "Semua Status" && true);
    const q = search.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(q) ||
      r.citizenName.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedRequests,
    resetPage,
  } = usePagination(filteredRequests, 10);

  useEffect(() => {
    resetPage();
  }, [search, statusFilter, resetPage]);

  const chooseProof = (file?: File) => {
    setProofError("");
    if (!file) return setProofDraft(null);

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !allowedTypes.includes(file.type) &&
      !["jpg", "jpeg", "png", "pdf"].includes(extension || "")
    ) {
      setProofDraft(null);
      return setProofError("Gunakan file berformat JPG, JPEG, PNG, atau PDF.");
    }

    if (file.size > 5 * 1024 * 1024) {
      setProofDraft(null);
      return setProofError("Ukuran file bukti penarikan maksimum 5 MB.");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofDraft({
        name: file.name,
        type: file.type || (extension === "pdf" ? "application/pdf" : "image/jpeg"),
        dataUrl: String(reader.result),
      });
    };
    reader.onerror = () => setProofError("File tidak dapat dibaca. Coba file lain.");
    reader.readAsDataURL(file);
  };

  const confirmProcess = () => {
    if (!processingRequest || processingRequest.status === "Selesai") return;
    if (!proofDraft) {
      return setProofError("Bukti transaksi penarikan / transfer wajib diunggah.");
    }

    setProcessing(true);
    setTimeout(() => {
      processWithdrawal(processingRequest.id, proofDraft);
      setProcessing(false);
      setProcessingRequest(null);
      setProofDraft(null);
    }, 500);
  };

  return (
    <>
      <PageTitle
        title="Permintaan Penarikan"
        desc="Kelola dan proses pengajuan penarikan saldo atau pemotongan iuran warga secara manual."
      />

      {/* Aggregate Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Permintaan"
          value={String(totalCount)}
          detail="Seluruh riwayat penarikan"
          icon={HandCoins}
        />
        <StatCard
          label="Menunggu Diproses"
          value={String(pendingCount)}
          detail="Perlu verifikasi & transfer"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Selesai Ditransfer"
          value={String(doneCount)}
          detail="Bukti transaksi terarsip"
          icon={CheckCircle2}
          tone="blue"
        />
      </div>

      {/* Table Card */}
      <Card className="mt-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Cari ID permintaan atau nama warga..."
            />
          </div>
          <StatusDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            className="sm:w-52"
          />
        </div>

        <div className="table-wrap">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  ID Permintaan
                </th>
                <th className="w-[180px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nama Warga
                </th>
                <th className="w-[180px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Jenis
                </th>
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                  Nominal
                </th>
                <th className="w-[200px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Keterangan
                </th>
                <th className="w-[130px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tanggal
                </th>
                <th className="w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                  Status
                </th>
                <th className="w-[160px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3.5 font-bold text-green-700 text-sm whitespace-nowrap">
                    {req.id}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 text-sm">
                    {req.citizenName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 text-sm">
                    {req.type}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm text-right whitespace-nowrap">
                    {money(req.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs max-w-[220px]">
                    <div className="truncate">{req.description}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs whitespace-nowrap">
                    {req.submittedDate}
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <Badge tone={req.status === "Selesai" ? "green" : "amber"}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setDetailRequest(req)}
                        className="min-h-8 px-3 py-1 text-xs cursor-pointer"
                      >
                        Detail
                      </Button>
                      {req.status === "Menunggu" ? (
                        <Button
                          onClick={() => {
                            setProcessingRequest(req);
                            setProofDraft(null);
                            setProofError("");
                          }}
                          className="min-h-8 px-3 py-1 text-xs cursor-pointer"
                        >
                          Proses
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => setPreviewRequest(req)}
                          className="min-h-8 px-3 py-1 text-xs cursor-pointer"
                        >
                          Lihat Bukti
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada data permintaan penarikan yang sesuai pencarian.
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="permintaan penarikan"
        />
      </Card>

      {/* Modal: Detail Permintaan */}
      {detailRequest && (
        <Modal title="Detail Permintaan Penarikan" onClose={() => setDetailRequest(null)}>
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <InfoRow label="ID Permintaan" value={detailRequest.id} />
            <InfoRow label="Nama Warga" value={detailRequest.citizenName} />
            <InfoRow label="Jenis Penarikan" value={detailRequest.type} />
            <InfoRow label="Nominal" value={money(detailRequest.amount)} />
            <InfoRow label="Tanggal Pengajuan" value={detailRequest.submittedDate} />
            <InfoRow
              label="Status"
              value={
                <Badge tone={detailRequest.status === "Selesai" ? "green" : "amber"}>
                  {detailRequest.status}
                </Badge>
              }
            />
            {detailRequest.processedDate && (
              <InfoRow label="Tanggal Diproses" value={detailRequest.processedDate} />
            )}
            {detailRequest.processedBy && (
              <InfoRow label="Diproses Oleh" value={detailRequest.processedBy} />
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Catatan / Keterangan
            </p>
            <p className="text-sm leading-relaxed text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
              {detailRequest.description || "Tidak ada catatan."}
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => setDetailRequest(null)}>
              Tutup
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal: Proses Permintaan (Upload Bukti) */}
      {processingRequest && (
        <Modal
          title="Proses & Verifikasi Penarikan"
          onClose={() => !processing && setProcessingRequest(null)}
        >
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <InfoRow label="ID Permintaan" value={processingRequest.id} />
            <InfoRow label="Nama Warga" value={processingRequest.citizenName} />
            <InfoRow label="Jenis" value={processingRequest.type} />
            <InfoRow label="Nominal Transfer" value={money(processingRequest.amount)} />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              Upload Bukti Transfer / Pemotongan
            </p>
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 px-5 py-6 text-center transition hover:border-green-500">
              <UploadCloud className="text-green-700" size={28} />
              <span className="mt-2 text-sm font-bold text-green-900">
                Pilih Foto Struk atau Dokumen PDF
              </span>
              <span className="mt-1 text-xs text-slate-500">
                JPG, JPEG, PNG, atau PDF · maks. 5 MB
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="sr-only"
                onChange={(e) => chooseProof(e.target.files?.[0])}
              />
            </label>

            {proofDraft && (
              <div className="mt-3 rounded-xl border border-green-200 bg-white p-3">
                <p className="truncate text-xs font-bold text-slate-800">
                  {proofDraft.name}
                </p>
                {proofDraft.type.startsWith("image/") && (
                  <img
                    src={proofDraft.dataUrl}
                    alt="Pratinjau bukti"
                    className="mt-2 max-h-48 w-full rounded-lg object-contain bg-slate-50"
                  />
                )}
              </div>
            )}

            {proofError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{proofError}</p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              disabled={processing}
              onClick={() => setProcessingRequest(null)}
            >
              Batal
            </Button>
            <Button disabled={processing} onClick={confirmProcess}>
              {processing ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              {processing ? "Menyimpan..." : "Konfirmasi & Selesaikan"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal: Lihat Bukti */}
      {previewRequest?.proof && (
        <Modal
          title={`Bukti Transaksi ${previewRequest.id}`}
          onClose={() => setPreviewRequest(null)}
          wide
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
            {previewRequest.proof.type === "application/pdf" ? (
              <iframe
                title={`Bukti ${previewRequest.id}`}
                src={previewRequest.proof.dataUrl}
                className="h-[60vh] w-full rounded-lg border-0"
              />
            ) : (
              <img
                src={previewRequest.proof.dataUrl}
                alt={`Bukti transaksi ${previewRequest.id}`}
                className="max-h-[60vh] w-full object-contain mx-auto"
              />
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <a
              href={previewRequest.proof.dataUrl}
              download={previewRequest.proof.name}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 transition"
            >
              <Download size={16} /> Unduh Bukti
            </a>
            <Button variant="secondary" onClick={() => setPreviewRequest(null)}>
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
