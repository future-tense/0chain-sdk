import * as bip39 from 'bip39';

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateMnemonic(): string {
    return bip39.generateMnemonic();
}
