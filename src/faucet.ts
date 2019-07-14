
import { Client } from './client';
import { Network } from './network';
import { Keypair } from './keypair';

import {
    signTransaction,
    Transaction,
    TransactionType
} from './transaction';
import { TransactionResponse } from './models';

const FaucetSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d3';

export class Faucet {

    static pour(
        client: Client,
        amount: number
    ): Promise<TransactionResponse> {
        return faucet.pour(
            client.network,
            client.keys,
            client.id,
            amount
        )
    }
}

export namespace faucet {

    export function pour(
        network: Network,
        keys: Keypair,
        clientId: string,
        amount: number
    ): Promise<TransactionResponse> {

        const payload = {
            name:   'pour',
            input:  {}
        };

        const tx = Transaction.create(
            clientId,
            FaucetSmartContractAddress,
            amount,
            JSON.stringify(payload),
            TransactionType.SMART_CONTRACT
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }
}