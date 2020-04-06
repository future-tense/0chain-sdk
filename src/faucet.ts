
import { Client } from './client';
import { Network } from './network';

import {
    signTransaction,
    Transaction
} from './transaction';

import { Keypair } from './keypair';

/**
 * @internal
 */

const FaucetSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d3';

/**
 * @public
 */

export class Faucet {

    /**
     *
     * @param client -
     * @param amount -
     */
    static pour(
        client: Client,
        amount: number
    ): Promise<Network.TransactionResponse> {
        return faucet.pour(
            client.network,
            client.keys,
            client.id,
            amount
        )
    }
}

/**
 * @public
 */

export namespace faucet {

    /**
     *
     * @param clientId -
     * @param amount -
     * @param timeStamp -
     */
    export function createPourTransaction(
        clientId: string,
        amount: number,
        timeStamp?: number
    ): Transaction {
        const payload = {
            name:   'pour',
            input:  {}
        };

        return Transaction.create(
            clientId,
            FaucetSmartContractAddress,
            amount,
            JSON.stringify(payload),
            Transaction.Type.SMART_CONTRACT,
            timeStamp
        );
    }

    /**
     *
     * @param network -
     * @param keys -
     * @param clientId -
     * @param amount -
     * @param timeStamp -
     */
    export function pour(
        network: Network,
        keys: Keypair,
        clientId: string,
        amount: number,
        timeStamp?: number
    ): Promise<Network.TransactionResponse> {

        const tx = createPourTransaction(
            clientId,
            amount,
            timeStamp
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }
}
