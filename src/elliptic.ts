import { eddsa as Eddsa } from 'elliptic';

const ec = new Eddsa('ed25519');

/**
 * @hidden
 */
export function generate(seed: Buffer): Buffer {
    const key = ec.keyFromSecret(seed);
    return Buffer.from(key.getPublic());
}

/**
 * @hidden
 */
export function sign(secretKey, message): Buffer {
    const sk = secretKey.slice(0, 32);
    const pk = secretKey.slice(32, 64);
    const key = ec.keyFromSecret(sk);
    key._pubBytes = Array.from(pk);
    return Buffer.from(key.sign(message).toBytes());
}

/**
 * @hidden
 */
export function verify(publicKey, message, signature) {
    return ec.verify(
        message,
        Array.from(signature),
        Array.from(publicKey)
    );
}
