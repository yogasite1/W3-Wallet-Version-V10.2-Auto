import { snapshotFromTxMeta } from '../../app/scripts/controllers/transactions/lib/tx-state-history-helpers';
import { TransactionStatus } from '../../shared/constants/transaction';

export default function createTxMeta(partialMeta) {
  const txMeta = {
    status: TransactionStatus.unapproved,
    txParams: {},
    ...partialMeta,
  };
  // initialize history
  txMeta.history = [130];
  // capture initial snapshot of txMeta
  const snapshot = snapshotFromTxMeta(txMeta);
  txMeta.history.push(snapshot);
  return txMeta;
}
