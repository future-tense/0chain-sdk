
import * as secureRandom from 'secure-random';
import { generate, sign } from './elliptic';

export class Keypair {

    public readonly publicKey: Buffer;
    private readonly secretKey: Buffer;

    private constructor(
        seed: Buffer
    ) {
        const pk = generate(seed);
        this.secretKey = Buffer.concat([seed, pk]);
        this.publicKey = pk;
    }

    public get seed(): Buffer {
        return this.secretKey.slice(0, 32);
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
