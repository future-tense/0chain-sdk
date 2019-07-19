
import {
    BlockResponse,
    BlockSummaryResponse,
    ChainStatsResponse,
    TransactionDetailResponse,
    TransactionResponse,
} from './models';

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
}

enum BlockInfoOptions {
    HEADER = 'header',
    FULL = 'full'
}

export interface NetworkConfig {
    miners: string[];
    sharders: string[];
    transaction_timeout?: number;
    clusterName: string;
    signaturescheme: 'bls0chain' |'ed25519';
}

export class Network {

    clusterName: string;
    consensusPercentage: number;

    miners: string[];
    sharders: string[];

    public constructor(config: NetworkConfig) {

        if (typeof config != 'undefined' &&
            'sharders' in config &&
            'sharders' in config &&
            'clusterName' in config
        ) {
            this.consensusPercentage = 20;
            this.miners = config.miners;
            this.sharders = config.sharders;
            this.clusterName = config.clusterName;
        }

        else {
            throw {};
        }

    }

    public getChainStats(): Promise<ChainStatsResponse> {
        return this.getInformationFromRandomSharder(
            Endpoints.GET_CHAIN_STATS
        );
    }

    public getRecentFinalized(): Promise<BlockSummaryResponse[]> {
        return this.getInformationFromRandomSharder(
            Endpoints.GET_RECENT_FINALIZED
        );
    }

    public getLatestFinalized(): Promise<BlockSummaryResponse>  {
        return this.getInformationFromRandomSharder(
            Endpoints.GET_LATEST_FINALIZED
        );
    }

    public async getBlockInfoByHash(
        hash: string
    ): Promise<BlockResponse> {

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
    ): Promise<BlockResponse> {

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
    ): Promise<BlockSummaryResponse> {

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
    ): Promise<BlockSummaryResponse> {

        const res = await this.getInformationFromRandomSharder(
            Endpoints.GET_BLOCK_INFO,
            {
                round: round,
                content: BlockInfoOptions.HEADER
            }
        );

        return res.header;
    }

    public async submitTransaction(
        tx: SignedTransaction
    ): Promise<TransactionResponse> {

        const res = await this.doParallelPostReqToAllMiners(
            Endpoints.PUT_TRANSACTION,
            tx
        );

        return res.entity;
    }

    public async waitForTransactionToFinish(
        hash: string
    ): Promise<TransactionDetailResponse> {
        const numTries = 15;

        for (let i = 0; i < numTries; i++) {
            await sleep(1000);
            try {
                return await this.checkTransactionStatus(hash);
            }
            catch (err) {}
        }

        throw {};
    }

    public async checkTransactionStatus(
        hash: string
    ): Promise<TransactionDetailResponse> {

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
