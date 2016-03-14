/**
 * 2015-03-22
 * mayc
 * generate keys
 */
"use strict"
let fs = require('fs');
let ursa = require('ursa');

let modulusBit = 512;  
let key  = ursa.generatePrivateKey(modulusBit, 65537);

let privatePem = ursa.createPrivateKey(key.toPrivatePem()); //����˽Կ
let privateKey = privatePem.toPrivatePem('utf8');
fs.writeFile('private.pem', privateKey, 'utf8', function(error){
    if(error){
        throw error;
    }
    console.log('\n˽ԿprivateKey�Ѿ�����\n');
    console.log('\n˽ԿprivateKey��\n' + privateKey);
});


let publicPem = ursa.createPublicKey(key.toPublicPem());   //���ɹ�Կ
let publicKey = publicPem.toPublicPem('utf8');
fs.writeFile('public.pub', publicKey, 'utf8', function(error){
    if(error){
        throw error;
    }
    console.log('\n˽ԿpublicKey�Ѿ�����\n');
    console.log('\n˽ԿpublicKey��\n' + publicKey);
});