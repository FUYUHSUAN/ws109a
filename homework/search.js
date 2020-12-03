import { get, post } from './esearch.js'
var rec=await get('/web2/page/_search', {page:'war'})//_search有底線的就是指令
console.log(rec.hits.hits[0]._source.url)
