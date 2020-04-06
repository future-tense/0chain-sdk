
import { sha3_256 as sha3 } from 'js-sha3';
import * as fetchClient from './fetch-client';
import { some } from './promise-some';

/**
 *
 * @internal
 * @param sharders -
 * @param endpoint -
 * @param params -
 */
export function getInformationFromRandomSharder(
    sharders: string[],
    endpoint: string,
    params = {}
): Promise<any> {

    const urls = sharders.map(sharder => sharder + endpoint);
    const promises = urls.map(url => fetchClient.get(url, params));
    return Promise.race(promises);
}

/**
 *
 * @internal
 * @param sharders -
 * @param endpoint -
 * @param params -
 * @param consensusPercentage -
 */
export async function getConsensusedInformationFromSharders(
    sharders: string[],
    endpoint: string,
    params: {},
    consensusPercentage: number
): Promise<any> {

    const urls = sharders.map(sharder => sharder + endpoint);
    const promises = urls.map(url => fetchClient.get(url, params));

    const res = await Promise.all(promises);
    const threshold = getThreshold(promises, consensusPercentage);
    const consensusResponse = getConsensusMessageFromResponse(res, threshold);
    if ('error' in consensusResponse) {
        throw consensusResponse;
    }

    return consensusResponse;
}

/**
 * @internal
 * @param miners -
 * @param endpoint -
 * @param postData -
 * @param consensusPercentage -
 */
export async function doParallelPostReqToAllMiners(
    miners: string[],
    endpoint: string,
    postData: {},
    consensusPercentage: number
): Promise<any> {

    const urls =  miners.map(miner => miner + endpoint);
    const promises = urls.map(url => fetchClient.post(url, postData));
    const threshold = getThreshold(promises, consensusPercentage);
    return await some(promises, threshold);
}

/**
 * @internal
 * @param promises -
 * @param percentage -
 */
function getThreshold(promises: any[], percentage: number) {
    return Math.max(1, Math.round(promises.length * percentage / 100));
}

/**
 * This will return the most voted response
 *
 * @internal
 * @param responses -
 * @param threshold -
 */

function getConsensusMessageFromResponse(
    responses: {}[],
    threshold: number
): {} {

    const hashes = responses.map(res => sha3(JSON.stringify(res)));

    let modeCount = 0;
    let modeKey = '';
    const counts = {};

    hashes.forEach(key => {
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > modeCount) {
            modeCount = counts[key];
            modeKey = key;
        }
    });

    if (modeCount < threshold) {
        throw {error: 'Not enough consensus'};
    }

    const index = hashes.indexOf(modeKey);
    return responses[index];
}
