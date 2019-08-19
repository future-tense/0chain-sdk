
import * as secureRandom from 'secure-random';
import { Ed25519Keypair } from './ed25519-keypair';
import { BlsKeypair } from './bls-keypair';

export interface Keypair {
    seed: Buffer;
    publicKey: Buffer;
    sign(message: Buffer): Buffer;
}

export class KeypairFactory {

    static fromSeed(
        seed: Buffer,
        type: 'bls0chain' | 'ed25519' = 'bls0chain'
    ): Keypair {
        if (type === 'bls0chain') {
            return BlsKeypair.fromSeed(seed);
        } else {
            return Ed25519Keypair.fromSeed(seed);
        }
    }

    static random(
        type: 'bls0chain' | 'ed25519' = 'bls0chain'
    ): Keypair {
        const seed = secureRandom(32, {type: 'Buffer'});
        return KeypairFactory.fromSeed(seed, type);
    }
}
