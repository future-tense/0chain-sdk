
import { sha3_256 as sha3 } from 'js-sha3';
import { Keypair } from './keypair';

export enum TransactionType {
    SEND = 0, // A transaction to send tokens to another account, state is maintained by account
    LOCK_IN = 2,
    DATA = 10, // A transaction to just store a piece of data on the block chain
    STORAGE_WRITE = 101, // A transaction to write data to the blobber
    STORAGE_READ  = 103,// A transaction to read data client_id the blobber
    SMART_CONTRACT = 1000 // A smart contract transaction transaction_type
}

/**
 *
 * @param keys
 * @param toClientId
 * @param val
 * @param note
 * @param transactionType
 */

export function createTransaction(
    keys: Keypair,
    toClientId: string,
    val,
    note,
    transactionType: TransactionType
) {

    const timeStamp = Math.floor(new Date().getTime() / 1000);
    const hashPayload = sha3(note);
    const hashData = `${timeStamp}:${keys.id}:${toClientId}:${val}:${hashPayload}`;
    const hash = sha3(hashData);

    const signature = keys.sign(Buffer.from(hash, 'hex'));

    return {
        client_id:          keys.id,
        transaction_value:  val,
        transaction_data:   note,
        transaction_type:   transactionType,
        creation_date:      timeStamp,
        to_client_id:       toClientId,
        hash:               hash,
        signature:          signature.toString('hex')
    };
}
