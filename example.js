
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

        const phrase0 = sdk.generateMnemonic();
        const client0 = sdk.Client.fromMnemonic(network, phrase0);
        const tx0 = await client0.register();
        await network.waitForTransactionToFinish(tx0.hash);

        const balance0 = await client0.getBalance();
        console.log('Balance:', balance0);

        console.log('Request faucet tokens');
        const tx1 = await sdk.faucet.pour(
            network,
            client0.keys,
            client0.id,
            10 * 1e10
        );
        const tx1Details = await network.waitForTransactionToFinish(tx1.hash);
        console.log('Faucet tx details', tx1Details);

        const balance1 = await client0.getBalance();
        console.log('Balance:', balance1);

        const phrase1 = await sdk.generateMnemonic();
        const client1 = sdk.Client.fromMnemonic(network, phrase1);
        const tx2 = await client1.register();
        await network.waitForTransactionToFinish(tx2.hash);

        const tx3 = await client0.send(client1.id, 1000);
        await network.waitForTransactionToFinish(tx3.hash);
        const balance2 = await client0.getBalance();
        console.log('Balance:', balance2);
    }

    catch (err) {
        console.log(err)
    }
})();
