
# @futuretense/0chain-sdk

An unofficial javascript SDK for the 0chain blockchain

## Installation

    $ npm install @futuretense/0chain-sdk



```
import * as sdk from '@futuretense/0chain-sdk';

```


Create a network

```
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
}

const network = new sdk.Network(config)
```


Copyright &copy; 2019 Future Tense, LLC
