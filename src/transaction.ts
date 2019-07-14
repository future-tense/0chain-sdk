
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

export class Transaction {

    client_id: string;
    to_client_id: string;
    transaction_value: number;
    transaction_data: string;
    transaction_type: TransactionType;

    creation_date: number;
    hash: string;

    constructor(
        from: string,
        to: string,
        value: number,
        note: string,
        type: TransactionType,
        timeStamp: number,
        hash: string
    ) {
        this.client_id = from;
        this.to_client_id = to;
        this.transaction_value = value;
        this.transaction_data = note;
        this.transaction_type = type;
        this.creation_date = timeStamp;
        this.hash = hash;
    }

    static create(
        keys: Keypair,
        to: string,
        value: number,
        note: string,
        type: TransactionType,
        timeStamp?: number
    ): Transaction {

        if (!timeStamp) {
            timeStamp = Math.floor(new Date().getTime() / 1000);
        }

        const hashPayload = sha3(note);
        const hashData = `${timeStamp}:${keys.id}:${to}:${value}:${hashPayload}`;
        const hash = sha3(hashData);

        return new Transaction(
            keys.id,
            to,
            value,
            note,
            type,
            timeStamp,
            hash
        )
    }
}

export class SignedTransaction extends Transaction {

    signature: string;

    constructor(
        tx: Transaction,
        signature: string
    ) {
        super(
            tx.client_id,
            tx.to_client_id,
            tx.transaction_value,
            tx.transaction_data,
            tx.transaction_type,
            tx.creation_date,
            tx.hash
        );

        this.signature = signature;
    }
}

export function signTransaction(
    tx: Transaction,
    keys: Keypair
): SignedTransaction {
    const signature = keys.sign(Buffer.from(tx.hash, 'hex')).toString('hex');
    return new SignedTransaction(tx, signature);
}
