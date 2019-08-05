
import * as reverse from 'buffer-reverse';
import { sha256 } from 'js-sha256';

import { CTX } from '@futuretense/milagro-crypto-js';
const { BIG, ECP, ECP2, FP, PAIR } = new CTX('BN254');

const bp = '11ccb44e77ac2c5dc32a6009594dbe331ec85a61290d6bbac8cc7ebb2dceb1280f204a14bbdac4a05be9a25176de827f2e60085668becdd4fc5fa914c9ee0d9a07c13d8487903ee3c1c5ea327a3a52b6cc74796b1760d5ba20ed802624ed19c8008f9642bbaacb73d8c89492528f58932f2de9ac3e80c7b0e41f1a84f1c40182';
const c1 = '252364824000000126cd890000000003cf0f0000000000060c00000000000004';
const c2 = '25236482400000017080eb4000000006181800000000000cd98000000000000b';

const G = ECP2.fromBytes(Buffer.from(bp, 'hex'));
const C1 = new FP(BIG.fromBytes(Buffer.from(c1, 'hex')));
const C2 = new FP(BIG.fromBytes(Buffer.from(c2, 'hex')));

const curveA = new FP(0);
const curveB = new FP(2);
const fpOne = new FP(1);

/**
 * @hidden
 * @param seed
 */
export function getPublicKey(seed) {
    const s = maskedBigFromArray(seed);
    return PAIR.G2mul(G, s);
}

/**
 * @hidden
 * @param pk
 */
export function pubkeyToBuffer(pk) {
    const a = Buffer.alloc(32);
    const b = Buffer.alloc(32);
    pk.x.a.redc().toBytes(a);
    pk.x.b.redc().toBytes(b);

    const yOdd = pk.y.a.redc().lastbits(1);
    b[0] |= yOdd << 7;

    return reverse(Buffer.concat([b, a]));
}

/**
 * @hidden
 * @param seed
 * @param message
 */
export function sign(seed, message) {
    const s = maskedBigFromArray(seed);
    const hm = hashAndMapToG1(message);
    return PAIR.G1mul(hm, s);
}

/**
 * @hidden
 * @param sig
 */
export function signatureToBuffer(sig) {
    const yOdd = sig.y.redc().lastbits(1);
    const sig2 = Buffer.alloc(32);
    sig.x.redc().toBytes(sig2, 32);
    sig2[0] |= yOdd << 7;
    return reverse(sig2);
}

function maskedBigFromArray(x) {
    const t = reverse(x);
    t[0] &= 0x1f;
    return BIG.fromBytes(t);
}

function getWeierstrass(x) {
    return new FP(x).sqr().add(curveA).mul(x).add(curveB);
}

function hashAndMapToG1(message) {
    const hash = sha256.array(message);
    const s = maskedBigFromArray(hash);
    const t = new FP(s);
    const negative = t.jacobi() < 0;
    const w = new FP(t)
        .sqr()
        .add(curveB)
        .add(fpOne)
        .inverse()
        .mul(C1)
        .mul(t);

    let x;
    for (let i = 0; i < 3; i++) {
        switch (i) {
            case 0:
                x = t.mul(w)
                    .neg()
                    .add(C2);
                break;
            case 1:
                x = x.neg()
                    .sub(fpOne);
                break;
            case 2:
                x = w.sqr()
                    .inverse()
                    .add(fpOne);
                break
        }

        let y = getWeierstrass(x);
        if (y.jacobi() >= 0) {
            y = y.sqrt();
            if (negative) {
                y = y.neg();
            }

            const P = new ECP();
            P.x = x;
            P.y = y;
            P.z = new FP(1);
            return P;
        }
    }
}
