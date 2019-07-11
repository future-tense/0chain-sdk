
const sdk = require('./lib');

const config = {
    'miners' : [
        'http://virb.devb.testnet-0chain.net:7071/',
        'http://vira.devb.testnet-0chain.net:7071/',
        'http://cala.devb.testnet-0chain.net:7071/',
        'http://calb.devb.testnet-0chain.net:7071/'  
    ],
    'sharders' : [
        'http://cala.devb.testnet-0chain.net:7171/',
        'http://vira.devb.testnet-0chain.net:7171/'  
    ],   
    'chain_id' :   '0afc093ffb509f059c55478bc1a60351cef7b4e9c008a53a6cc8241ca8617dfe',
    'clusterName' : 'devb',
    'transaction_timeout' : 20,
    'state ' : true
};

const network = new sdk.Network(config);

(async function() {
    try {
        const chainStats = await network.getChainStats();
        console.log('chainStats', chainStats);

        const blockHundred = await network.getBlockInfoByRound(100);
        console.log('100th block', blockHundred);

        const latestBlock = await network.getLatestFinalized();
        console.log('latestBlock', latestBlock);

        const recentBlocks = await network.getRecentFinalized();
        console.log('recentBlocks', recentBlocks);

        const keys0 = await sdk.generateWallet();
        const tx0 = await sdk.client.register(network, keys0.id, keys0.publicKey);
        await network.waitForTransactionToFinish(tx0.hash);

        const balance0 = await sdk.client.getBalance(network, keys0.id);
        console.log('Balance:', balance0);

        console.log('Request faucet tokens');
        const tx1 = await sdk.faucet.pour(network, keys0, 10 * 1e10);
        const tx1Details = await network.waitForTransactionToFinish(tx1.hash);
        console.log('Faucet tx details', tx1Details);

        const balance1 = await sdk.client.getBalance(network, keys0.id);
        console.log('Balance:', balance1);

        const keys1 = await sdk.generateWallet();
        const tx2 = await sdk.client.register(network, keys1.id, keys1.publicKey);
        await network.waitForTransactionToFinish(tx2.hash);

        const tx3 = await sdk.client.send(network, keys0, keys1.id, 1000, '');
        await network.waitForTransactionToFinish(tx3.hash);
        const balance2 = await sdk.client.getBalance(network, keys0.id);
        console.log('Balance:', balance2);
    }

    catch (err) {
        console.log(err)
    }
})();
