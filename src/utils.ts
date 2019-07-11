
import { Keypair } from './keypair';
import * as bip39 from 'bip39';

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function restoreWallet(
    mnemonic: string
): Keypair {
    const seed = bip39.mnemonicToSeed(mnemonic).slice(32);
    return Keypair.fromSeed(seed);
}

export async function generateWallet(): Promise<Keypair> {
    const mnemonic = bip39.generateMnemonic();
    const keys = restoreWallet(mnemonic);
    console.log(keys.id, mnemonic);
    return keys;
}
