/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    //Constructor of the class
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if (this.height === -1) {
            let block = new BlockClass.Block({ data: 'Genesis Block' });
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    // getLatest block method
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //addBlock(block) will store a block in the chain
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let getChainHeight = self.height;
            if (getChainHeight === -1) {
            } else {
                block.height = getChainHeight + 1;
            }
            block.time = new Date().getTime().toString().slice(0, -3);
            if (self.chain.length > 0) {
                block.previousBlockHash = self.chain[self.chain.length-1].hash;
            }
            block.hash = SHA256(JSON.stringify(block)).toString();
            self.chain.push(block);
            self.height += 1;
            resolve(block);
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            const ownershipMessage = `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`;
            resolve(ownershipMessage);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            //Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
            let timeSent = parseInt(message.split(':')[1]);
            //Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
            let timeNow = parseInt(new Date().getTime().toString().slice(0, -3));
            //Check if the time elapsed is less than 5 minutes
            if ((timeNow - timeSent) > 5 * 60) {
                let why = 'Way too much time has passed';
                reject(why);
            } else {
                //Verify the message with wallet address and signature
                if (bitcoinMessage.verify(message, address, signature)) {
                    //Create the block and add it to the chain
                    let blocky = new BlockClass.Block({ "user": address, "star": star });
                    self._addBlock(blocky);
                    resolve(blocky);
                } else {
                    let why = 'Something went wrong';
                    reject(why);
                }
            }

        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.hash === hash)[0];
            if (block) {
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        //console.log("I am getBlockByHeight");
        //console.log("height in the function");
        //console.log(height);
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            //console.log("block in the function");
            //console.log(JSON.stringify(block));
            if (block) {
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress(address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            for (const block in self.chain) {
                let data = block.getBdata();
                if (data.user === address) {
                    stars.push[data];
                }
            }
            if (stars) {
                resolve(stars);
            } else {
                resolve(null);
            }

        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            for (const block in self.chain) {
                //validate each block
                if (!block.validateBlock()) {
                    errorLog.push(`Block number ${block.height} has an invalid hash`);
                }
                //check with the previousBlockHash
                let previous = block.getLatestBlock().hash;
                if (!block.previousHash === previous) {
                    errorLog.push(`Block number ${block.height} has an invalid previousBlockHash`);
                }
            }
            if (errorLog.length > 1) {
                resolve(errorLog);
            } else {
                resolve(null);
            }
        });
    }

}

module.exports.Blockchain = Blockchain;   