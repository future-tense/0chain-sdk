
/**
 * A promise wrapper that either resolves when `threshold` or more of the
 * supplied promises are resolved, and rejects otherwise.
 *
 * @internal
 * @param promises
 * @param threshold
 */

export function some(
    promises: Promise<any>[],
    threshold: number
): Promise<any> {

    const failure = promises.length - threshold + 1;
    let numFailures = 0;
    let numSuccesses = 0;

    return new Promise((resolve, reject) => {
        promises.map(p => p
            .then(res => {
                numSuccesses += 1;
                if (numSuccesses === threshold) {
                    resolve(res);
                }
            })
            .catch(err => {
                numFailures += 1;
                if (numFailures === failure) {
                    reject(err);
                }
            })
        );
    });
}
