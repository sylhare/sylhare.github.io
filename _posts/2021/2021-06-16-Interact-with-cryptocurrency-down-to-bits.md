---
layout: post 
title: Interact with CryptoCurrency 💸 down to bits 
color: rgb(55,83,2)
tags: [java]
---

## Simple Blockchain overview

### In a nutshell

Let's not go into too many details here, just a simplified version of how a blockchain generally work. There are a lot
of information [out there](https://weteachblockchain.org/).

A blockchain is not only for _cryptocurrencies_, it is a like a digital ledger that keeps track of all the information
taking place on a peer to peer network.

That information or data that is shared can be currency, contracts, token of ownership (
like [NFTs](https://www.forbes.com/advisor/investing/nft-non-fungible-token/)).

The transactions of these data are sent from peer to peer directly and are confirmed by the other peers on the network,
it's decentralized, and the certifying authority's responsibility (which makes a transaction legit) is shared among all
peers.

### Cryptocurrency case

Let's look at how the cryptocurrency generally [works](https://www.simplilearn.com/bitcoin-mining-explained-article).

Let's say we have Alistair 🙋‍♂️ who wishes to send bitcoins to Belinda 🙆‍♀️ in exchange for some Gucci goodies:

<div class="mermaid">
graph LR
    A["&#128104;"] ---|Send bitcoins|B["&#128105;"]
</div>

Nice, now that we have that done, Belinda 🙆‍♀️‍ is just going to wait for confirmation (around 6 of them) that Alistair
🙋‍♂️ did really send the money and is not trying to scam her. Let's look at how
this [transaction](https://www.bitcoin.com/get-started/how-bitcoin-transactions-work/) gets processed:

<div class="mermaid"> 
sequenceDiagram
  participant T as Transaction
  participant M as Memory pool
  participant BC as blockchain
  participant P as Peers 👨‍👩‍👧‍👦
  T -->> M : Transaction gets added to a memory pool for next block
  M ->> P : Peers mine the memory pool to find the next block of transaction
  P -->> M : One miner solves the puzzle
  Note over P: That creates a block
  P ->> M: Other peers on the network accept that block
  M ->> BC: Block gets added to the blockchain
  BC ->> P: Gives the reward to the miner + transactions fees
  Note over M,P: The transaction is confirmed once and the mining process keeps on going to add more blocks <br> each blocks adding confirmation to the previous one
</div>

So each new block is a confirmation of payment. In the case of a fraudulent transaction is made, where there is _double
spending_ (meaning two transactions are made)
then the memory pool would have those two transactions! If mined into two blocks you could have:

- a block with Alistair 🙋‍♂️‍ Transaction to Belinda 🙆‍♀️
- _another_ block where the transaction goes to buy pizza 🍕!!

In order to avoid [that](https://learnmeabitcoin.com/beginners/mining), and preserve the chain integrity two things can
happen:

- the latest transaction will be refused automatically, and not added to a block.
    - In this case you'll see it right away if there was a fraud attempt
- If both transaction are in a block, the transaction in the most accepted block by the community will remain in the
  chain
    - In this case a transaction is validated by the peers. It takes multiple other blocks on top to be sure that it's
      accepted.

The older your transaction is in terms of block the more certain you are that it's _legit_. Usually it takes 6
confirmations (6 blocks added to the blockchain) for a merchant to accept payment, it is deemed highly unlikely to be
able to push a fraudulent transaction in the blockchain from 6 blocks ago.

### Bitcoin specificity

In the bitcoins world, you can have around **2.7k transactions per blocks**, and new blocks are added to the bitcoin
blockchain **every 10min** by miners. Mining requires high performance GPUs to solve mathematical problems and find
blocks.

Miners make the bitcoin works, and the reward for that is an amount of bitcoin (that get halved every _210'000_ blocks).
However, there's a finite amount of **21 millions bitcoins** (and we've already mined more than _18_ millions). Once all
the bitcoin are available, mining may become less interesting, the miners still get the transaction fees of the block.
In the case the amount of mining decreases (hence the number of possible transactions) the protocol may change
through [BIPs](https://github.com/bitcoin/bips)
(Bitcoin Improvement Proposals). 🤷‍♀️

Which leads to one downside of bitcoin (besides its awful ecological footprint 🌳), it's that if there's a majority pool
of miners, they can decide which blocks go in the blockchain.

This is well explained
in [O'Reilly mastering bitcoin](https://www.oreilly.com/library/view/mastering-bitcoin/9781491902639/ch08.html)
and it's all about forks of blocks in the blockchain and convergence between the multiple pools of miners. If you have
enough computational power to force the blocks you want in the blockchain, it might lose its integrity.

## Libraries

You would need a library to interface with the bitcoin network and manage your coins. For that a popular choice
is [bitcoinj](https://bitcoinj.org/#getting-started) which comes with its caveat but is pretty safe for experimentation.

Add it to your java project using gradle:

```groovy
implementation 'org.bitcoinj:bitcoinj-core:0.15.10'
```

Most of the examples are also in [sylhare/Blockboot](https://github.com/sylhare/Blockboot) for reference. Though the
best are the ones directly from the library
itself [bitcoinj's examples](https://github.com/bitcoinj/bitcoinj/tree/master/examples/src/main/java/org/bitcoinj/examples)!

### Key components

First, you'll need two things, the _networkParameters_ which is basically which network you're using either test for
trials or prod for real money. The script type,
here [P2WPKH](https://programmingblockchain.gitbook.io/programmingblockchain/other_types_of_ownership/p2wpkh_pay_to_witness_public_key_hash) (
Pay to Witness Public Key Hash), because transaction fees are lower, it's fraud proof and is compatible with newer
featured introduced in 2015 with SegwitAddress (Segregated Witness)

```java
final static NetworkParameters networkParameters = NetworkParameters.fromID(NetworkParameters.ID_TESTNET);
final static Script.ScriptType scriptType = Script.ScriptType.P2WPKH;
```

Now that's set up, here are the other main components.
Check [bitcoinj work with wallet](https://bitcoinj.org/working-with-the-wallet), but some example might be out of date.

#### Wallet

A Wallet is used to store your ECKeys and other data.

When you create a wallet you get multiple account, usually those are managed by the online coin broker you may be using,
so you don't get to know them very well.

```java
Wallet wallet = Wallet.createDeterministic(networkParameters, scriptType);
```

Deterministic wallets come with address key hierarchy already set up. Public key are expendable, they should only be
used once, so your transactions can't be tracked on the blockchain.

#### Blockchain and BlockStore

The BlockChain instance manages the shared, global data structure. However, the actual data of the blockchain is
accessible via the BlockStore (which can be on your disk).

```java
MemoryBlockStore blockStore = new MemoryBlockStore(networkParameters);
BlockChain blockchain = new BlockChain(networkParameters, wallet, blockStore);
```

The created blockchain needs to be connected to a given wallet.

#### PeerGroup

A PeerGroup instance manages the network connections:

```java
PeerGroup peerGroup = new PeerGroup(networkParameters, blockChain);
peerGroup.startAsync();
```

You pass your blockchain to your peerGroup, so you can download some blocks from the peers and sync. The peerGroup is
necessary when you will want to make a Transaction:

```java
Wallet.SendResult result = wallet.sendCoins(peerGroup, targetAddress, Coin.parseCoin("0.0005"));
LOG.info("Transaction {} was made - status: {}", result.tx.getTxId(), result.broadcastComplete.get());
wallet.getBalance(targetAddress);
```

With that you're all set up to start sending coins!
Sending coin is not automatic (has said before, the transaction needs to be mined into a block) which means the whole
process needs to be _asynchronous_.

> The [satoshi](https://www.investopedia.com/terms/s/satoshi.asp) is the smallest unit of the bitcoin cryptocurrency named after the bitcoin's creator

Now, to simplify setting them up, there is also a `WalletAppKit` object that creates all you need above and connects
them together.

Find how to use it in [bitcoinj getting started](https://bitcoinj.org/getting-started-java).

### External links

If you're playing with the test network blockchain, and you got some BTC from a faucet (that gives some for free), you
may want to find your wallet information using your address with:

- Web UI: [`https://blockstream.info/testnet/address/{address}`](https://blockstream.info/testnet/address/)
- API: [`https://api.blockcypher.com/v1/btc/test3/addrs/{address}/balance`](https://api.blockcypher.com/v1/btc/test3/addrs/)

With that, it's time to let your crypto money fly away 💸

