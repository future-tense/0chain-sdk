
import { sha3_256 as sha3 } from 'js-sha3';
import * as bip39 from 'bip39';

import { Network } from './network';
import { Keypair } from './keypair';

import {
    signTransaction,
    Transaction
} from './transaction';

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
        const keys = Keypair.fromSeed(seed);
        return new Client(network, keys);
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
}
