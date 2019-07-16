
import { sha3_256 as sha3 } from 'js-sha3';
import { Network } from './network';
import { Keypair } from './keypair';

import {
    signTransaction,
    Transaction,
    TransactionType
} from './transaction';

import * as fetchClient from './fetch-client';

const StorageSmartContractAddress =
    '6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d7';

enum Endpoints {
    GET_SCSTATE = 'v1/scstate/get',

    // SC REST
    SC_REST = 'v1/screst/',
    SC_REST_ALLOCATION = 'v1/screst/6dba10422e368813802877a85039d3985d96760ed844092319743fb3a76712d7/allocation',

    //BLOBBER
    ALLOCATION_FILE_LIST = '/v1/file/list/',
    FILE_META =  '/v1/file/meta/',
}

export namespace storage {

    export enum AllocationType {
        FREE = 'Free',
        PREMIUM = 'Premium',
        MONETIZE = 'Monetize'
    }

    export type AllocationOptions = {
        num_writes: number,
        data_shards: number,
        parity_shards: number,
        type: AllocationType,
        size: number,
        expiration_date: number
    }

    export function createStoreDataTransaction(
        clientId: string,
        payload: any,
        timeStamp?: number
    ) {
        return Transaction.create(
            clientId,
            '',
            0,
            payload,
            TransactionType.DATA,
            timeStamp
        );
    }

    export function storeData(
        network: Network,
        keys: Keypair,
        clientId: string,
        payload: any,
        timeStamp?: number
    ) {
        const tx = createStoreDataTransaction(
            clientId,
            payload,
            timeStamp
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }

    export function createAllocateStorageTransaction(
        clientId: string,
        options: AllocationOptions,
        timeStamp?: number
    ) {
        const payload = {
            name: 'new_allocation_request',
            input: options
        };

        return Transaction.create(
            clientId,
            StorageSmartContractAddress,
            0,
            JSON.stringify(payload),
            TransactionType.SMART_CONTRACT,
            timeStamp
        );
    }

    export function allocateStorage(
        network: Network,
        keys: Keypair,
        clientId: string,
        options: AllocationOptions,
        timeStamp?: number
    ) {
        const tx = createAllocateStorageTransaction(
            clientId,
            options,
            timeStamp
        );

        const signedTx = signTransaction(tx, keys);
        return network.submitTransaction(signedTx);
    }

    export function getStorageSmartContractStateForKey(
        network: Network,
        keyName: string,
        keyValue: string
    ) {
        return network.getConsensusedInformationFromSharders(
            Endpoints.GET_SCSTATE,
            {
                key: `${keyName}:${keyValue}`,
                sc_address: StorageSmartContractAddress
            }
        );
    }

    export function getAllocationInfo(
        network: Network,
        id: string
    ) {
        return network.getConsensusedInformationFromSharders(
            Endpoints.SC_REST_ALLOCATION,
            {
                allocation: id
            }
        );
    }

    export function computeStoragePartDataId(allocationId, path, fileName, partNum) {
        return sha3(`${allocationId}:${path}:${fileName}:${partNum}`);
    }

    export async function getAllocationFilesFromPath(allocationId, blobberList, path) {

        const files: any = [];

        for (let blobber of blobberList) {
            try {
                const blobberUrl = blobber + Endpoints.ALLOCATION_FILE_LIST + allocationId;
                const data = await fetchClient.get(blobberUrl, { path: path });

                if (data.entries != null && data.entries.length > 0) {

                    for (let fileData of data.entries) {
                        // files not contains the element we're looking for so add
                        if (!files.some(e => e.LookupHash === fileData.LookupHash)) {
                            files.push(fileData);
                        }
                    }
                }
            }
            catch (error) {
                // console.log(error);
            }
        }

        return files;
    }

    export function getFileMetaDataFromBlobber(allocation_id, blobber_url, path, fileName) {
        return fetchClient.get(blobber_url + allocation_id, {path: path, filename: fileName});
    }
}
