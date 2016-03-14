"use strict"
let crypto=require('crypto');
let assert = require('assert');  
let fs = require('fs');
let ursa = require('ursa');
let key = ursa.createPrivateKey(fs.readFileSync('/ssl/rsa/my-server.key.pem'));
let crt = ursa.createPublicKey(fs.readFileSync('/ssl/rsa/my-server.pub'));
//AES����
let encrypt = (str, secret)  => {
    let cipher = crypto.createCipher('aes-256-cbc', secret);
    let enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}
//AES����
let decrypt = (str, secret)  => {
    let decipher = crypto.createDecipher('aes-256-cbc', secret);
    let dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

//RSA���� 
let encryptRsa = (str) =>  {
	return  crt.encrypt(str, 'utf8', 'base64');	
}	

//RSA����
let decryptRsa = (str) => {
	return  key.decrypt(str, 'base64', 'utf8');	
}


let cipheriv = (en, code, data) => {   
	 let buf1 = en.update(data, code), buf2 = en.final();  
	 let r = new Buffer(buf1.length + buf2.length);   
	 buf1.copy(r); 
	 buf2.copy(r, buf1.length);   
	 return r;
 };
 

 //DES���� data������ key ������Կ  vi���� ��Կ���� 
let encrypt3Des = (data, key, ivs) =>  {  
    let keys = getDesKey(key);  
	/*let buffArray = '';//�������
	for(let i = 0;i<keys.length;i++)
	{
		buffArray += ','+keys.readInt8(i).toString();
	}*/
    let iv = new Buffer(ivs ? ivs : 0);
    let plaintext = new Buffer(data);
    let alg = 'des-ede3';
    let autoPad = true;   
    let cipher = crypto.createCipheriv(alg, keys, iv);  
    cipher.setAutoPadding(autoPad);  //default true  
	//let ciph = cipher.update(plaintext, 'utf8', 'hex');  //�����ַ��� 
    let ciph = cipher.update(plaintext);  //���ص���buffer
    //ciph += cipher.final();//�����ַ������ӷ�ʽ
	ciph = Buffer.concat([ciph,cipher.final()]);	//����buffer�����ӷ�ʽ	
	//decrypt3Des(ciph,keys,iv);//����
    return (ciph.toString("base64"));   
  
}  

 let getDesKey = (norInfo) => {
	let key = new Buffer(24);
	for (let i = 0; i < 3; i++)
	{
		let str = Buffer(norInfo.substring(i));
        let buf = encryptMd51(str);
		for (let j = 0; j < 8; j++)
		{			
			key[(j + i * 8)] = buf[j];
		}
	}
	return key;	 
 }
 

 //DES���ܣ�ciph���ģ�
 let decrypt3Des = (ciph, key, vi) => { 
    let keys = key ? key : getDesKey(key); 
    let iv = new Buffer(iv ? iv : 0);
    let alg = 'des-ede3';
    let autoPad = true;    
	let decipher = crypto.createDecipheriv(alg, keys, iv);  
    decipher.setAutoPadding(autoPad)  
    let txt = decipher.update(ciph);  
    txt += decipher.final(); 
    return 	txt;
 };

 let encryptMd51 = (data) =>  {
	let buf = new Buffer(data);
	//let str = buf.toString("binary");
    return crypto.createHash("md5").update(buf).digest();
}
 
 //MD5����
 let encryptMd5 = (data) =>  {
    let buf = new Buffer(data,'hex');
    let str = buf.toString("binary");
	//MD5������ɵ�ժҪ��Ϣ��16���ֽڣ�SHA1��20���ֽڡ�hex��ʾ������16���ƣ�Ĭ����
    return crypto.createHash("md5").update(str).digest();
}

let crytoUtils = {
	encrypt:encrypt,
	decrypt:decrypt,
	encrypt3Des:encrypt3Des,
	decrypt3Des:decrypt3Des,
	encryptRsa:encryptRsa,
	decryptRsa:decryptRsa,
	encryptMd5:encryptMd5
};
module.exports = crytoUtils;