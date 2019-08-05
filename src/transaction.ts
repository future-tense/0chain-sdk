
import { sha3_256 as sha3 } from 'js-sha3';
import { Ed25519Keypair } from './ed25519-keypair';

export class Transaction {

    client_id: string;
    to_client_id: string;
    transaction_value: number;
    transaction_data: string;
    transaction_type: Transaction.Type;

    creation_date: number;
    hash: string;

    protected constructor(
        from: string,
        to: string,
        value: number,
        note: string,
        type: Transaction.Type,
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
        from: string,
        to: string,
        value: number,
        note: string,
        type: Transaction.Type,
        timeStamp?: number
    ): Transaction {

        if (!timeStamp) {
            timeStamp = Math.floor(new Date().getTime() / 1000);
        }

        const hashPayload = sha3(note);
        const hashData = `${timeStamp}:${from}:${to}:${value}:${hashPayload}`;
        const hash = sha3(hashData);

        return new Transaction(
            from,
            to,
            value,
            note,
            type,
            timeStamp,
            hash
        );
    }
}

export namespace Transaction {

    export enum Type {

        /**
         * A transaction to send tokens to another account
         */
        SEND = 0,
        LOCK_IN = 2,

        /**
         * A transaction to store a piece of data on the block chain
         */
        DATA = 10,

        /**
         * A transaction to write data to the blobber
         */
        STORAGE_WRITE = 101,

        /**
         * A transaction to read data from the blobber
         */
        STORAGE_READ  = 103,

        /**
         * A smart contract transaction
         */
        SMART_CONTRACT = 1000
    }
}

export class SignedTransaction extends Transaction {

    signature: string;

    private constructor(
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

    static create(tx, signature): SignedTransaction {
        return new SignedTransaction(tx, signature);
    }
}

export function signTransaction(
    tx: Transaction,
    keys: Ed25519Keypair
): SignedTransaction {
    const signature = keys.sign(Buffer.from(tx.hash, 'hex')).toString('hex');
    return SignedTransaction.create(tx, signature);
}
