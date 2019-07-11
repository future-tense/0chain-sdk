
import { Network } from './network';
import { Keypair } from './keypair';

import {
    TransactionType,
    createTransaction
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
        } catch (err) {
            if (err.error === 'value not present') {
                return 0;
            }

            throw err;
        }
    }

    export function createSendTransaction(
        keys: Keypair,
        toClientId,
        amount,
        note
    ) {
        return createTransaction(
            keys,
            toClientId,
            amount,
            note,
            TransactionType.SEND
        );
    }

    export function send(
        network: Network,
        keys: Keypair,
        toClientId,
        amount,
        note
    ): Promise<TransactionResponse> {

        const data = createSendTransaction(
            keys,
            toClientId,
            amount,
            note
        );

        return network.submitTransaction(data);
    }
}
