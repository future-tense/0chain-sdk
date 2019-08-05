
import { sha3_256 as sha3 } from 'js-sha3';
import * as bip39 from 'bip39';

import { Network } from './network';

import {
    signTransaction,
    Transaction
} from './transaction';

import { Ed25519Keypair } from './ed25519-keypair';

const InterestPoolSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d9';

enum Endpoints {
    GET_BALANCE = 'v1/client/get/balance',
    REGISTER_CLIENT = 'v1/client/put',
    GET_LOCKED_TOKENS = 'v1/screst/6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d9/getPoolsStats'
}

export class Client {

    keys: Ed25519Keypair;
    network: Network;
    id: string;

    constructor(
        network: Network,
        keys: Ed25519Keypair
    ) {
        this.network = network;
        this.keys = keys;
        this.id = sha3(keys.publicKey);
    }

    register(): Promise<Network.RegisterClientResponse> {
        return client.register(
            this.network,
            this.id,
            this.keys.publicKey
        );
    }

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

    static fromMnemonic(
        network: Network,
        phrase: string
    ): Client {
        const seed = bip39.mnemonicToSeed(phrase).slice(32);
        const keys = Ed25519Keypair.fromSeed(seed);
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
        keys: Ed25519Keypair,
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
        keys: Ed25519Keypair,
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
        keys: Ed25519Keypair,
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
