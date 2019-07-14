
import { sha3_256 as sha3 } from 'js-sha3';
import * as bip39 from 'bip39';

import { Network } from './network';
import { Keypair } from './keypair';

import {
    signTransaction,
    Transaction,
    TransactionType,
} from './transaction';

import {
    RegisterClientResponse,
    TransactionResponse
} from './models';

enum Endpoints {
    GET_BALANCE = 'v1/client/get/balance',
    REGISTER_CLIENT = 'v1/client/put',
}

export class Client {

    keys: Keypair;
    network: Network;
    id: string;

    constructor(
        network: Network,
        keys: Keypair
    ) {
        this.network = network;
        this.keys = keys;
        this.id = sha3(Buffer.from(keys.publicKey, 'hex'));
    }

    register(): Promise<RegisterClientResponse> {
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

    send(
        to: string,
        amount: number,
        note?: any
    ): Promise<TransactionResponse> {
        return client.send(
            this.network,
            this.keys,
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
        const keys = Keypair.fromSeed(seed);
        return new Client(network, keys);
    }
}

export namespace client {

    export async function register(
        network: Network,
        id: string,
        pubKey: string
    ): Promise<RegisterClientResponse> {

        const data = {
            public_key: pubKey,
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

    export function createSendTransaction(
        from: string,
        to: string,
        amount: number,
        note: any
    ): Transaction {

        return Transaction.create(
            from,
            to,
            amount,
            note,
            TransactionType.SEND
        )
    }

    export function send(
        network: Network,
        keys: Keypair,
        toClientId: string,
        amount: number,
        note: any
    ): Promise<TransactionResponse> {

        const tx = createSendTransaction(
            keys.id,
            toClientId,
            amount,
            note
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }
}
