import * as secureRandom from 'secure-random';

import {
    PrivateKey,
    PublicKey
} from '@futuretense/herumi-bls';

import { Keypair } from './keypair';

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
