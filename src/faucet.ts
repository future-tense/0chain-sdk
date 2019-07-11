
import { Network } from './network';
import { Keypair } from './keypair';

import {
    createTransaction,
    TransactionType
} from './transaction';

const FaucetSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d3';

export namespace faucet {

    export function pour(
        network: Network,
        keys: Keypair,
        amount: number
    ) {

        const payload = {
            name:   'pour',
            input:  {}
        };

        const data = createTransaction(
            keys,
            FaucetSmartContractAddress,
            amount,
            JSON.stringify(payload),
            TransactionType.SMART_CONTRACT
        );

        return network.submitTransaction(data);
    }
}
