
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
