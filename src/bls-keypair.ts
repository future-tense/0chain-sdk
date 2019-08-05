
import * as secureRandom from 'secure-random';
import * as bls from './herumi-bls-sign';
import { Keypair } from './keypair';

export class BlsKeypair implements Keypair {

    seed: Buffer;
    publicKey: Buffer;

    constructor(
        seed: Buffer
    ) {
        const pk = bls.getPublicKey(seed);
        this.publicKey = bls.pubkeyToBuffer(pk);
        this.seed = seed;
    }

    public sign(
        message: Buffer
    ): Buffer {

        const sig = bls.sign(this.seed, message);
        return bls.signatureToBuffer(sig);
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
