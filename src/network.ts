
import { SignedTransaction } from './transaction';
import { sleep } from './utils';
import * as cluster from './cluster';

enum Endpoints {
    PUT_TRANSACTION = 'v1/transaction/put',
    GET_RECENT_FINALIZED = 'v1/block/get/recent_finalized',
    GET_LATEST_FINALIZED = 'v1/block/get/latest_finalized',
    GET_CHAIN_STATS = 'v1/chain/get/stats',
    GET_BLOCK_INFO = 'v1/block/get',
    CHECK_TRANSACTION_STATUS = 'v1/transaction/get/confirmation',
    CHECK_CONTRACT_STATUS = 'v1/scstate/get'
}

enum BlockInfoOptions {
    HEADER = 'header',
    FULL = 'full'
}

const InterestPoolSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d9';

export class Network {

    clusterName: string;
    consensusPercentage: number;
    signaturescheme: 'ed25519' | 'bls0chain';

    miners: string[];
    sharders: string[];

    public constructor(config: Network.Config) {

        if (typeof config != 'undefined' &&
            'sharders' in config &&
            'sharders' in config &&
            'clusterName' in config &&
            'signaturescheme' in config
        ) {
            this.consensusPercentage = 20;
            this.miners = config.miners;
            this.sharders = config.sharders;
            this.clusterName = config.clusterName;
            this.signaturescheme = config.signaturescheme;
        }

        else {
            throw {};
        }
    }

    public getChainStats(): Promise<Network.ChainStatsResponse> {
        return this.getInformationFromRandomSharder(
            Endpoints.GET_CHAIN_STATS
        );
    }

    public getRecentFinalized(): Promise<Network.BlockSummaryResponse[]> {
        return this.getInformationFromRandomSharder(
            Endpoints.GET_RECENT_FINALIZED
        );
    }

    public getLatestFinalized(): Promise<Network.BlockSummaryResponse>  {
        return this.getInformationFromRandomSharder(
            Endpoints.GET_LATEST_FINALIZED
        );
    }

    public async getBlockInfoByHash(
        hash: string
    ): Promise<Network.BlockResponse> {

        const res = await this.getInformationFromRandomSharder(
            Endpoints.GET_BLOCK_INFO,
            {
                block: hash,
                content: BlockInfoOptions.FULL
            }
        );

        return res.block;
    }

    public async getBlockInfoByRound(
        round: number
    ): Promise<Network.BlockResponse> {

        const res = await this.getInformationFromRandomSharder(
            Endpoints.GET_BLOCK_INFO,
            {
                round: round,
                content: BlockInfoOptions.FULL
            }
        );

        return res.block;
    }

    public async getBlockSummaryByHash(
        hash: string
    ): Promise<Network.BlockSummaryResponse> {

        const res = await this.getInformationFromRandomSharder(
            Endpoints.GET_BLOCK_INFO,
            {
                block: hash,
                content: BlockInfoOptions.HEADER
            }
        );

        return res.header;
    }

    public async getBlockSummaryByRound(
        round: number
    ): Promise<Network.BlockSummaryResponse> {

        const res = await this.getInformationFromRandomSharder(
            Endpoints.GET_BLOCK_INFO,
            {
                round: round,
                content: BlockInfoOptions.HEADER
            }
        );

        return res.header;
    }

    public getLockingConfig(): Promise<any> {

        return this.getInformationFromRandomSharder(
            Endpoints.CHECK_CONTRACT_STATUS,
            {
                sc_address: InterestPoolSmartContractAddress,
                key: InterestPoolSmartContractAddress
            }
        );
    }

    public async submitTransaction(
        tx: SignedTransaction
    ): Promise<Network.TransactionResponse> {

        const res = await this.doParallelPostReqToAllMiners(
            Endpoints.PUT_TRANSACTION,
            tx
        );

        return res.entity;
    }

    public async waitForTransactionToFinish(
        hash: string
    ): Promise<Network.TransactionDetailResponse> {
        const numTries = 15;

        let res;
        for (let i = 0; i < numTries; i++) {
            await sleep(1000);
            try {
                return await this.checkTransactionStatus(hash);
            }
            catch (err) {
                res = err;
            }
        }

        throw res;
    }

    public async checkTransactionStatus(
        hash: string
    ): Promise<Network.TransactionDetailResponse> {

        const res = await this.getConsensusedInformationFromSharders(
            Endpoints.CHECK_TRANSACTION_STATUS,
            {
                hash: hash
            }
        );

        const result = {
            transaction: res.txn,
            confirmation: res
        };

        delete result.confirmation.txn;

        return result;
    }

    public getInformationFromRandomSharder(
        endpoint: string,
        params = {}
    ): Promise<any> {
        return cluster.getInformationFromRandomSharder(
            this.sharders,
            endpoint,
            params
        );
    }

    public getConsensusedInformationFromSharders(
        endpoint: string,
        params: {},
    ): Promise<any> {
        return cluster.getConsensusedInformationFromSharders(
            this.sharders,
            endpoint,
            params,
            this.consensusPercentage
        );
    }

    public doParallelPostReqToAllMiners(
        endpoint: string,
        postData: {}
    ): Promise<any> {
        return cluster.doParallelPostReqToAllMiners(
            this.miners,
            endpoint,
            postData,
            this.consensusPercentage
        );
    }
}

export namespace Network {

    export interface Config {
        miners: string[];
        sharders: string[];
        transaction_timeout?: number;
        clusterName: string;
        signaturescheme: 'bls0chain' | 'ed25519';
    }

    export interface ChainStatsResponse {
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
    }

    export interface BlockSummaryResponse {
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

    export interface BlockResponse {
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

    export interface TransactionResponse {
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
        transaction_interface: number;
        transaction_output?; string;
        transaction_status: number;
        txn_output_hash?: string;
    }

    export interface VerificationTicket {
        verifier_id: string;
        signature: string;
    }

    export interface TransactionDetailResponse {
        transaction: TransactionResponse;
        confirmation: Confirmation;
    }

    export interface Confirmation {
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

    interface MerkleTreePath {
        nodes: string[];
        leaf_index: number;
    }

    export interface RegisterClientResponse {
        id: string;
        version: string;
        creation_date: number;
        public_key: string;
    }
}

