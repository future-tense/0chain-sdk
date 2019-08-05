
import { sha3_256 as sha3 } from 'js-sha3';
import * as bip39 from 'bip39';

import { Network } from './network';

import {
    signTransaction,
    Transaction
} from './transaction';

import { Keypair, KeypairFactory } from './keypair';

const InterestPoolSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d9';

enum Endpoints {
    GET_BALANCE = 'v1/client/get/balance',
    REGISTER_CLIENT = 'v1/client/put',
    GET_LOCKED_TOKENS = 'v1/screst/6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d9/getPoolsStats'
}

/**
 * High-level client API
 */

export class Client {

    keys: Keypair;
    network: Network;
    id: string;

    /**
     * Create a new Client instance
     *
     * @param network
     * @param keys
     */
    constructor(
        network: Network,
        keys: Keypair
    ) {
        this.network = network;
        this.keys = keys;
        this.id = sha3(keys.publicKey);
    }

    /**
     * Register the Client on the network
     */
    register(): Promise<Network.RegisterClientResponse> {
        return client.register(
            this.network,
            this.id,
            this.keys.publicKey
        );
    }

    /**
     * Retrieve the Client balance
     */
    getBalance(): Promise<number> {
        return client.getBalance(
            this.network,
            this.id
        );
    }

    getLockStatus(): Promise<any> {
        return client.getLockStatus(
            this.network,
            this.id
        );
    }

    /**
     * Send ZCN to a client
     *
     * @param to
     * @param amount
     * @param note
     */
    send(
        to: string,
        amount: number,
        note?: any
    ): Promise<Network.TransactionResponse> {
        return client.send(
            this.network,
            this.keys,
            this.id,
            to,
            amount,
            note
        );
    }

    /**
     * Create a Client instance using a mnemonic phrase
     *
     * @param network
     * @param phrase
     */
    static fromMnemonic(
        network: Network,
        phrase: string
    ): Client {
        const seed = bip39.mnemonicToSeed(phrase).slice(32);
        const keys = KeypairFactory.fromSeed(seed, network.signaturescheme);
        return new Client(network, keys);
    }

    lock(
        amount: number,
        hours: number,
        minutes: number
    ): Promise<Network.TransactionResponse> {

        return client.lock(
            this.network,
            this.keys,
            this.id,
            amount,
            hours,
            minutes
        )
    }

    unlock(
        poolId: string
    ): Promise<Network.TransactionResponse> {

        return client.unlock(
            this.network,
            this.keys,
            this.id,
            poolId
        )
    }
}

/**
 * Low-level client API
 */

export namespace client {

    export async function register(
        network: Network,
        id: string,
        pubKey: Buffer
    ): Promise<Network.RegisterClientResponse> {

        const data = {
            public_key: pubKey.toString('hex'),
            id: id
        };

        const res = await network.doParallelPostReqToAllMiners(
            Endpoints.REGISTER_CLIENT,
            data
        );

        return res.entity;
    }

    export async function getBalance(
        network: Network,
        id: string
    ): Promise<number> {

        try {
            const res = await network.getConsensusedInformationFromSharders(
                Endpoints.GET_BALANCE,
                {
                    client_id: id
                }
            );

            return res.balance;
        }

        catch (err) {
            if (err.error === 'value not present') {
                return 0;
            }

            throw err;
        }
    }

    export function getLockStatus(
        network: Network,
        id: string
    ): Promise<any> {

        return network.getInformationFromRandomSharder(
            Endpoints.GET_LOCKED_TOKENS,
            {
                client_id: id
            }
        );
    }

    /**
     * Create a Transaction instance
     *
     * @param from
     * @param to
     * @param amount
     * @param note
     * @param timeStamp
     */
    export function createSendTransaction(
        from: string,
        to: string,
        amount: number,
        note: any,
        timeStamp?: number
    ): Transaction {

        return Transaction.create(
            from,
            to,
            amount,
            note,
            Transaction.Type.SEND,
            timeStamp
        )
    }

    export function send(
        network: Network,
        keys: Keypair,
        from: string,
        to: string,
        amount: number,
        note: any,
        timeStamp?: number
    ): Promise<Network.TransactionResponse> {

        const tx = createSendTransaction(
            from,
            to,
            amount,
            note,
            timeStamp
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }

    export function createLockTransaction(
        id: string,
        amount: number,
        hours: number,
        minutes: number
    ) : Transaction {

        const payload = {
            name: 'lock',
            input: {
                duration: `${hours}h${minutes}m`
            }
        };

        return Transaction.create(
            id,
            InterestPoolSmartContractAddress,
            amount,
            JSON.stringify(payload),
            Transaction.Type.SMART_CONTRACT
        );
    }

    export function lock(
        network: Network,
        keys: Keypair,
        id: string,
        amount: number,
        hours: number,
        minutes: number
    ): Promise<Network.TransactionResponse> {

        const tx = createLockTransaction(
            id,
            amount,
            hours,
            minutes
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }

    export function createUnlockTransaction(
        id: string,
        poolId: string
    ) : Transaction {

        const payload = {
            name: 'unlock',
            input: {
                pool_id: poolId
            }
        };

        return Transaction.create(
            id,
            InterestPoolSmartContractAddress,
            0,
            JSON.stringify(payload),
            Transaction.Type.SMART_CONTRACT
        );
    }

    export function unlock(
        network: Network,
        keys: Keypair,
        id: string,
        poolId: string
    ): Promise<Network.TransactionResponse> {

        const tx = createUnlockTransaction(
            id,
            poolId
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }
}
