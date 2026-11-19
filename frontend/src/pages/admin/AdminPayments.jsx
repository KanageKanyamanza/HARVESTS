// Jour 85 — Back-office « paiements et payouts ».
// Liste les payins, payouts et remboursements (statuts, tentatives, coûts
// réels AfriBaPay) et les agrégats de coûts par devise. Interface admin en
// français (décision J69-2). Alimenté par GET /admin/payments,
// GET /admin/payouts et GET /payments/admin/provider-costs.
import React, { useCallback, useEffect, useState } from "react";
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Landmark,
	RefreshCw,
	RotateCcw,
} from "lucide-react";

import { adminService } from "../../services/adminService";

const money = (value, currency) =>
	new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: currency || "XOF",
		maximumFractionDigits: 0,
	}).format(Number(value) || 0);

const shortDate = (value) =>
	value ? new Date(value).toLocaleDateString("fr-FR") : "—";

const STATUS_STYLES = {
	succeeded: "bg-emerald-50 text-emerald-700",
	paid: "bg-emerald-50 text-emerald-700",
	pending: "bg-amber-50 text-amber-700",
	processing: "bg-amber-50 text-amber-700",
	ambiguous: "bg-orange-50 text-orange-700",
	network_issue: "bg-orange-50 text-orange-700",
	failed: "bg-rose-50 text-rose-700",
	cancelled: "bg-slate-100 text-slate-600",
};

const StatusBadge = ({ status }) => (
	<span
		className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
			STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
		}`}
	>
		{status || "—"}
	</span>
);

const TABS = [
	{ key: "payments", label: "Paiements", icon: CreditCard },
	{ key: "payouts", label: "Payouts", icon: Landmark },
	{ key: "refunds", label: "Remboursements", icon: RotateCcw },
];

const AdminPayments = () => {
	const [activeTab, setActiveTab] = useState("payments");
	const [statusFilter, setStatusFilter] = useState("");
	const [page, setPage] = useState(1);
	const [payments, setPayments] = useState([]);
	const [payouts, setPayouts] = useState([]);
	const [currencies, setCurrencies] = useState({});
	const [floatBalances, setFloatBalances] = useState({});
	const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState("");

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const params = { page, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) };
			const [paymentResult, payoutResult, costResult] = await Promise.all([
				adminService.getPayments(params),
				adminService.getPayouts(params),
				adminService.getProviderCosts({ period: "30d" }),
			]);
			setPayments(paymentResult?.data?.payments || []);
			setPayouts(payoutResult?.data?.payouts || []);
			setCurrencies(costResult?.data?.currencies || {});
			setPagination({
				page: paymentResult?.page || 1,
				total: paymentResult?.total || 0,
				totalPages: paymentResult?.totalPages || 1,
			});
			// Le solde est lu chez AfriBaPay : un échec ne bloque pas la page.
			try {
				const floatResult = await adminService.getFloatBalances();
				setFloatBalances(floatResult?.data?.balances || {});
			} catch {
				setFloatBalances({});
			}
		} catch {
			setError("Impossible de charger les paiements.");
		} finally {
			setLoading(false);
		}
	}, [page, statusFilter]);

	useEffect(() => {
		load();
	}, [load]);

	const retryPayin = async (paymentId) => {
		setBusy(paymentId);
		try {
			await adminService.retryPayment(paymentId);
			await load();
		} catch {
			setError("La relance du paiement a échoué.");
		} finally {
			setBusy("");
		}
	};

	const retryRefund = async (payment) => {
		const refund = payment.refunds?.find((entry) => entry.status === "failed");
		if (!refund) return;
		setBusy(refund.refundId);
		try {
			// Une relance est un nouvel essai AfriBaPay, jamais une clôture
			// locale : le backend refuse tout remboursement déjà confirmé.
			await adminService.refundPayment(payment._id || payment.paymentId, {
				refundId: refund.refundId,
				reason: "Relance manuelle depuis le back-office",
			});
			await load();
		} catch {
			setError("La relance du remboursement a échoué.");
		} finally {
			setBusy("");
		}
	};

	const refunds = payments.flatMap((payment) =>
		(payment.refunds || []).map((refund) => ({ ...refund, payment })),
	);
	const rows = activeTab === "payments" ? payments : activeTab === "payouts" ? payouts : refunds;
	const costEntries = Object.entries(currencies);

	return (
		<div className="dashboard-page">
			<div className="dashboard-container">
			<div className="mb-5">
				<h1 className="text-xl font-black text-gray-800">
					Paiements <span className="text-green-600">& payouts</span>
				</h1>
				<p className="text-xs text-gray-500">
					Suivi mobile money : statuts, tentatives et coûts réels AfriBaPay.
				</p>
			</div>

			{/* Soldes de float AfriBaPay par pays (Jour 85). */}
			{Object.keys(floatBalances).length > 0 && (
				<section className="mb-5 grid gap-3 md:grid-cols-3">
					{Object.entries(floatBalances).map(([country, balance]) => (
						<div key={country} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
							<div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
								Float {country}
							</div>
							<div className="mt-1 text-sm font-black text-gray-800">
								{balance?.error
									? "Indisponible"
									: `${new Intl.NumberFormat("fr-FR").format(balance?.available || 0)} ${balance?.currency || ""}`}
							</div>
						</div>
					))}
				</section>
			)}

			{/* Coûts réels par devise (Jour 84) — la marge HARVESTS les supporte. */}
			<section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				{costEntries.length === 0 && (
					<div className="rounded-xl border border-gray-100 bg-white p-4 text-xs text-gray-500">
						Aucun coût capturé sur la période.
					</div>
				)}
				{costEntries.map(([currency, buckets]) => (
					<div key={currency} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-sm font-black text-gray-800">{currency}</span>
							<span className="text-[10px] font-bold uppercase text-gray-400">
								coûts réels (30 j)
							</span>
						</div>
						<div className="space-y-1 text-xs text-gray-600">
							<div className="flex justify-between">
								<span>Encaissements</span>
								<span className="font-bold">{money(buckets?.payin?.total, currency)}</span>
							</div>
							<div className="flex justify-between">
								<span>Reversements</span>
								<span className="font-bold">{money(buckets?.payout?.total, currency)}</span>
							</div>
							<div className="flex justify-between">
								<span>Remboursements</span>
								<span className="font-bold">{money(buckets?.refund?.total, currency)}</span>
							</div>
							<div className="flex justify-between border-t border-gray-100 pt-1 font-black text-gray-800">
								<span>Total</span>
								<span>{money(buckets?.all?.total, currency)}</span>
							</div>
						</div>
					</div>
				))}
			</section>

			<div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
					<div className="flex gap-1">
						{TABS.map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								type="button"
								onClick={() => {
									setActiveTab(key);
									setPage(1);
								}}
								className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
									activeTab === key
										? "bg-green-600 text-white"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								<Icon className="h-3.5 w-3.5" />
								{label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<select
							aria-label="Filtrer par statut"
							value={statusFilter}
							onChange={(event) => {
								setStatusFilter(event.target.value);
								setPage(1);
							}}
							className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700"
						>
							<option value="">Tous les statuts</option>
							<option value="succeeded">Réussi</option>
							<option value="pending">En attente</option>
							<option value="ambiguous">Ambigu</option>
							<option value="failed">Échoué</option>
						</select>
						<button
							type="button"
							onClick={load}
							title="Actualiser"
							className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
						>
							<RefreshCw className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>

				{error && (
					<div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-rose-600">
						<AlertCircle className="h-4 w-4" />
						{error}
					</div>
				)}

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-500">
							<tr>
								<th className="px-4 py-2">Date</th>
								<th className="px-4 py-2">Référence</th>
								<th className="px-4 py-2">Montant</th>
								<th className="px-4 py-2">Statut</th>
								<th className="px-4 py-2">Tentatives</th>
								<th className="px-4 py-2">Coût réel</th>
								<th className="px-4 py-2">Action</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr>
									<td colSpan={7} className="px-4 py-6 text-center text-gray-400">
										Chargement…
									</td>
								</tr>
							)}
							{!loading && rows.length === 0 && (
								<tr>
									<td colSpan={7} className="px-4 py-6 text-center text-gray-400">
										Aucune transaction.
									</td>
								</tr>
							)}
							{!loading &&
								rows.map((row) => {
									const payment = row.payment || row;
									const attempts =
										row.attempt ||
										row.attempts?.length ||
										payment.paymentDetails?.afribapay?.attempt ||
										0;
									const cost = row.fees || row.paymentDetails?.afribapay?.fees;
									const reference =
										row.refundId ||
										row.paymentId ||
										payment.paymentId ||
										String(payment._id || "").slice(-8);
									const canRetryPayin =
										activeTab === "payments" &&
										row.method === "mobile_money" &&
										row.status === "failed";
									const canRetryRefund = activeTab === "refunds" && row.status === "failed";
									return (
										<tr key={reference + row._id} className="border-t border-gray-50">
											<td className="px-4 py-2 text-gray-500">
												{shortDate(row.createdAt || row.processedAt || payment.paidAt)}
											</td>
											<td className="px-4 py-2 font-mono text-[11px] text-gray-700">{reference}</td>
											<td className="px-4 py-2 font-bold text-gray-800">
												{money(row.amount ?? payment.amount, row.currency || payment.currency)}
											</td>
											<td className="px-4 py-2">
												<StatusBadge status={row.status} />
											</td>
											<td className="px-4 py-2 text-gray-600">{attempts || "—"}</td>
											<td className="px-4 py-2 text-gray-600">
												{cost?.total != null ? money(cost.total, row.currency || payment.currency) : "—"}
											</td>
											<td className="px-4 py-2">
												{canRetryPayin && (
													<button
														type="button"
														disabled={busy === row._id}
														onClick={() => retryPayin(row._id || row.paymentId)}
														className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
													>
														Relancer
													</button>
												)}
												{canRetryRefund && (
													<button
														type="button"
														disabled={busy === row.refundId}
														onClick={() => retryRefund(payment)}
														className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
													>
														Relancer
													</button>
												)}
												{!canRetryPayin && !canRetryRefund && (
													<span className="text-gray-300">—</span>
												)}
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</div>

				<div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
					<span>{pagination.total} transaction(s)</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							disabled={page <= 1}
							onClick={() => setPage((value) => Math.max(value - 1, 1))}
							className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"
							title="Page précédente"
						>
							<ChevronLeft className="h-3.5 w-3.5" />
						</button>
						<span>
							{pagination.page} / {pagination.totalPages || 1}
						</span>
						<button
							type="button"
							disabled={page >= pagination.totalPages}
							onClick={() => setPage((value) => value + 1)}
							className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"
							title="Page suivante"
						>
							<ChevronRight className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
			</div>
		</div>
	);
};

export default AdminPayments;
