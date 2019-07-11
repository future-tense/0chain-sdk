
export type ChainStatsResponse = {
    block_size: number;
    count: number;
    current_round: number;
    delta: number;
    max: number;
    mean: number;
    min: number;
    percentile_50: number;
    percentile_90: number;
    percentile_95: number;
    percentile_99: number;
    rate_15_min: number;
    rate_1_min: number;
    rate_5_min: number;
    rate_mean: number;
    std_dev: number;
    total_txns: number;
};

export type BlockSummaryResponse = {
    version: string;
    creation_date: number;
    hash: string;
    round: number;
    round_random_seed: number;
    miner_id: string;
    merkle_tree_root: string;
    state_hash: string;
    receipt_merkle_tree_root: string;
    num_txns: number;
}

export type BlockResponse = {
    version: string;
    creation_date: number;
    magic_block_hash: string;
    prev_hash: string;
    miner_id: string;
    round: number;
    round_random_seed: number;
    state_hash: string;
    hash: string;
    signature: string;
    chain_id: string;
    chain_weight: number;
    prev_verification_tickets: VerificationTicket[];
    transactions: TransactionResponse[];
    verification_tickets: VerificationTicket[];
}

export type TransactionResponse = {
    hash: string;
    version: string;
    client_id: string;
    to_client_id?: string;
    chain_id: string;
    transaction_fee: number;
    transaction_data: string;
    transaction_value: number;
    signature: string;
    creation_date: number;
    transaction_type: number;
    transaction_output?; string;
    transaction_status: number;
    txn_output_hash?: string;
}

export type VerificationTicket = {
    verifier_id: string;
    signature: string;
}

export type TransactionDetailResponse = {
    transaction: TransactionResponse;
    confirmation: Confirmation;
}

export type Confirmation = {
    version: string;
    hash: string;
    block_hash:string;
    creation_date: number;
    round: number;
    round_random_seed: number;
    merkle_tree_root: string;
    merkle_tree_path: MerkleTreePath;
    receipt_merkle_tree_root: string;
    receipt_merkle_tree_path: MerkleTreePath;
}

type MerkleTreePath = {
    nodes: string[];
    leaf_index: number;
}

export type RegisterClientResponse = {
    id: string;
    version: string;
    creation_date: number;
    public_key: string;
}
