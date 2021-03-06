import * as secureRandom from 'secure-random';

import {
    PrivateKey,
    PublicKey,
    Signature
} from '@futuretense/herumi-bls';

import { Keypair } from './keypair';

/**
 * @public
 */

export class BlsKeypair implements Keypair {

    _sk: PrivateKey;
    _pk: PublicKey;
    seed: Buffer;
    publicKey: Buffer;

    private constructor(
        seed: Buffer
    ) {
        this._sk = PrivateKey.fromBuffer(seed);
        this._pk = PublicKey.fromPrivateKey(this._sk);
        this.publicKey = this._pk.toBuffer();
        this.seed = seed;
    }

    public sign(
        message: Buffer
    ): Buffer {
        return this._sk.sign(message)
            .toBuffer();
    }

    public verify(
        message: Buffer,
        signature: Buffer
    ): boolean {
        const sig = Signature.fromBuffer(signature);
        return this._pk.verify(message, sig);
    }

    static fromSeed(
        seed: Buffer
    ): BlsKeypair {
        return new BlsKeypair(seed);
    }

    static random(): BlsKeypair {
        const seed = secureRandom(32, {type: 'Buffer'});
        return new BlsKeypair(seed);
    }
}
