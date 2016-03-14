"use strict"
let config = require('../config/config');
let path = require('path');
let zlib = require('zlib');
let fs = require('fs');
let logger = require('../logger/log').logger('response');
let mimeType = {
    jpg:'image/jpeg', 
    gif:'image/gif', 
    png:'image/png', 
    svg:'image/svg',
    zip:'application/zip', 
    pdf:'application/pdf', 
    xls:'application/vnd.ms-excel', 
    ppt:'application/vnd.ms-powerpoint', 
    doc:'application/msword', 
    htm:'text/html', 
    css:'text/css',
    html:'text/html',
    js:'text/javascript',
    xml: 'text/xml',
    tiff: 'image/tiff',
    txt: 'text/plain',
	mp3: 'audio/mpeg'
};

let getMimeType = (ext)  => {
    let type = mimeType[ext];
    if (!type)
        return 'text/plain';
    else
        return type;
}

let response = (res, type, data) =>  {
    res.charset = config.charset;
    res.set({
        'content-type': type
    });
    if (type.indexOf('text/')>=0)
        res.end(data);
    else
        res.end(data, 'binary');
}
/**
��ȡ����json���͸�ʽ
*/
let execute = (res) => {
	res.charset = config.charset;
    res.set({
        'content-type': 'application/json'
    });
}
/**
��ȡʹ��ģ�������ļ�
*/
let executeTemplete = (res) => {
	res.charset = config.charset;
    res.set({
        'content-type': 'text/html'
    });
}
/**
����̬�ļ�
*/
let executeHtml = (res,req,realpath) => {
	try {
		fs.stat(realpath, function(err, pathStat) {
			if (err) {
				response(res, 'text/plain', 'file 404');
			}
			else
			{             
				if(pathStat.isDirectory()){//�����Ŀ¼��ȡindex.html
							realpath += 'index.html';
				}
				
				/***ѹ���汾  ��ʵ��init��������������ѹ���м���Ѿ������������ﲻ��Ҫ����
				  if (matched && acceptEncoding.match(/\bgzip\b/)) {

					  res.writeHead(200, 'Ok', {'Content-Encoding': 'gzip'});

					  raw.pipe(zlib.createGzip()).pipe(res);

				  } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {

					  res.writeHead(200, 'Ok', {'Content-Encoding': 'deflate'});

					  raw.pipe(zlib.createDeflate()).pipe(res);

				  } else {

					  res.writeHead(200, 'Ok');

					  raw.pipe(res);

				  }*/
				let ext = path.extname(realpath);
				ext = ext 
				? ext.slice(1) 
				: 'unknown';
				let raw = fs.createReadStream(realpath);

				let acceptEncoding = req.headers['accept-encoding'] || '';

				let matched = ext.match(config.compress.match);
				
				
				let lastModified = pathStat.mtime.toUTCString();
			
				let ifModifiedSince = 'If-Modified-Since'.toLowerCase();
			
				res.setHeader('Last-Modified', lastModified);
				
				if (ext.match(config.compress.fileMatch)) {

					let expires = new Date();

					expires.setTime(expires.getTime() + config.compress.maxAge * 1000);

					res.setHeader('Expires', expires.toUTCString());

					res.setHeader('Cache-Control', 'max-age=' + config.compress.maxAge);

				}
				
					
				if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
					res.charset = config.charset;
					res.writeHead(304, 'Thinkive');

					res.end();

				}else
				{
					fs.readFile(realpath, function(err, file) {
						let tokens = realpath.split('.');
						let ext = tokens[tokens.length-1];
						response(res, getMimeType(ext), file);
					})
						/*
						let raw = fs.createReadStream(realpath);
				  let acceptEncoding = req.headers['accept-encoding'] || '';
				  let matched = ext.match(config.compress.match);

				  if (matched && acceptEncoding.match(/\bgzip\b/)) {
					  res.writeHead(200, 'Ok', {'Content-Encoding': 'gzip'});
					  raw.pipe(zlib.createGzip()).pipe(res);
				  } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
					  res.writeHead(200, 'Ok', {'Content-Encoding': 'deflate'});
					  raw.pipe(zlib.createDeflate()).pipe(res);
				  } else {
					  res.writeHead(200, 'Ok');
					  raw.pipe(res);
				  }*/

				}
		
			}
				
		}); 
  } catch (err) {
    response(res, 'text/plain', '�ļ���ȡ�쳣');
  }
}	
let res = {
	execute:execute,
	executeHtml:executeHtml,
	executeTemplete:executeTemplete
};
module.exports = res;