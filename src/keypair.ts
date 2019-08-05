
import * as secureRandom from 'secure-random';
import { Ed25519Keypair } from './ed25519-keypair';
import { BlsKeypair } from './bls-keypair';

export interface Keypair {
    seed: Buffer;
    publicKey: Buffer;
    sign(message: Buffer): Buffer;
}

export class KeypairFactory {

    static fromSeed(seed: Buffer, type: 'bls0chain' | 'ed25519' = 'bls0chain') {
        if (type === 'bls0chain') {
            return new BlsKeypair(seed);
        } else {
            return Ed25519Keypair.fromSeed(seed);
        }
    }

    static fromRandom(type: 'bls0chain' | 'ed25519' = 'bls0chain') {
        const seed = secureRandom(32, {type: 'Buffer'});
        return KeypairFactory.fromSeed(seed, type);
    }
}
