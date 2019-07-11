
import { sha3_256 as sha3 } from 'js-sha3';
import * as secureRandom from 'secure-random';

import { generate, sign } from './elliptic';

export class Keypair {

    public readonly id: string;
    public readonly publicKey: string;
    private readonly secretKey: Buffer;

    private constructor(
        seed: Buffer
    ) {
        const pk = generate(seed);
        this.id = sha3(pk);
        this.secretKey = Buffer.concat([seed, pk]);
        this.publicKey = pk.toString('hex');
    }

    public sign(
        message: Buffer
    ): Buffer {
        return sign(this.secretKey, message);
    }

    static fromSeed(
        seed: Buffer
    ): Keypair {
        return new Keypair(seed);
    }

    static random(): Keypair {
        const seed = secureRandom(32, {type: 'Buffer'});
        return new Keypair(seed);
    }
}
