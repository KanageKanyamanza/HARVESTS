// Statuts de remboursement qui engagent déjà de l'argent (Jour 83).
// Source unique partagée entre le modèle Payment (virtuel reservedRefunded)
// et le service AfriBaPay (refundableAmount, verifyReservedAmount, …) :
// deux listes séparées pouvaient dériver silencieusement.
const RESERVED_REFUND_STATUSES = ["pending", "ambiguous", "succeeded"];

module.exports = { RESERVED_REFUND_STATUSES };
