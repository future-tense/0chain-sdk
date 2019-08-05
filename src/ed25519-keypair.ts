
import * as secureRandom from 'secure-random';
import { generate, sign } from './elliptic';
import { Keypair } from './keypair';

/**
 *
 */

export class Ed25519Keypair implements Keypair {

    public readonly publicKey: Buffer;
    private readonly secretKey: Buffer;

    private constructor(
        seed: Buffer
    ) {
        const pk = generate(seed);
        this.secretKey = Buffer.concat([seed, pk]);
        this.publicKey = pk;
    }

    /**
     * Return the seed that this Ed25519Keypair was generated with
     */
    public get seed(): Buffer {
        return this.secretKey.slice(0, 32);
    }

    /**
     * Sign a message
     *
     * @param message
     */
    public sign(
        message: Buffer
    ): Buffer {
        return sign(this.secretKey, message);
    }

    /**
     * Generate a Ed25519Keypair using a provided seed
     *
     * @param seed
     */
    static fromSeed(
        seed: Buffer
    ): Ed25519Keypair {
        return new Ed25519Keypair(seed);
    }

    /**
     * Generate a Ed25519Keypair using a random seed.
     */
    static random(): Ed25519Keypair {
        const seed = secureRandom(32, {type: 'Buffer'});
        return new Ed25519Keypair(seed);
    }
}
