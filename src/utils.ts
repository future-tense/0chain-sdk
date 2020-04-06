import * as bip39 from 'bip39';

/**
 * Sleep for a number of milliseconds.
 *
 * Returns a promise that resolves when the time has elapsed.
 *
 * @public
 * @param ms -
 */

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a BIP39 mnemonic recovery phrase that can be used to create a Client
 * in [[Client.fromMnemonic]]()
 *
 * @public
 */

export function generateMnemonic(): string {
    return bip39.generateMnemonic();
}
