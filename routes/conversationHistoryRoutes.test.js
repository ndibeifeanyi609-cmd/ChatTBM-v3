'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const postgres = require('../database/Postgres');
const rows = new Map();
const fakePool = {
 async query(sql, values) {
  if (sql.startsWith('INSERT INTO chattbm_chat_history')) {
   const [userId, id, encoded] = values;
   const row = { user_id:userId, conversation_id:id, messages:JSON.parse(encoded), updated_at:new Date() };
   rows.set(userId+':'+id,row); return {rows:[row],rowCount:1};
  }
  if (sql.includes('WHERE user_id = $1 AND conversation_id = $2')) {
   const row=rows.get(values[0]+':'+values[1]); return {rows:row?[row]:[],rowCount:row?1:0};
  }
  if (sql.includes('WHERE user_id = $1 ORDER BY updated_at DESC')) {
   const found=[...rows.values()].filter(x=>x.user_id===values[0]).slice(0,values[1]); return {rows:found,rowCount:found.length};
  }
  throw Error('Unexpected SQL: '+sql);
 }
};
postgres.getPool=()=>fakePool;
const {router,validateMessages}=require('./conversationHistoryRoutes');
test('validates history payloads and isolates accounts',async()=>{
 rows.clear();
 assert.equal(validateMessages([]).success,true);
 assert.equal(validateMessages([{id:'x',role:'system',content:'bad'}]).success,false);
 assert.equal(validateMessages([{id:'x',role:'user',content:' '}]).success,false);
 const app=express(); app.use(express.json());
 app.use((req,res,next)=>{req.authUser={id:req.headers['x-test-user']||''};next();});
 app.use('/api/conversations',router);
 const server=http.createServer(app);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/api/conversations';
 const headers=user=>({'Content-Type':'application/json','x-test-user':user});
 try {
  const payload={messages:[{id:'u1',role:'user',content:'Hello',timestamp:100},{id:'a1',role:'assistant',content:'Hi',timestamp:200}]};
  const saved=await fetch(base+'/interaction-1',{method:'PUT',headers:headers('user-a'),body:JSON.stringify(payload)});
  assert.equal(saved.status,200); assert.equal((await saved.json()).conversation.messages.length,2);
  assert.equal((await fetch(base+'/interaction-1',{headers:headers('user-a')})).status,200);
  assert.equal((await fetch(base+'/interaction-1',{headers:headers('user-b')})).status,404);
  assert.equal((await (await fetch(base,{headers:headers('user-a')})).json()).conversations.length,1);
  assert.equal((await (await fetch(base,{headers:headers('user-b')})).json()).conversations.length,0);
  const bad=await fetch(base+'/interaction-2',{method:'PUT',headers:headers('user-a'),body:JSON.stringify({messages:[{id:'x',role:'system',content:'bad'}]})});
  assert.equal(bad.status,400);
  assert.equal((await fetch(base,{headers:headers('')})).status,401);
 } finally { await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve())); }
});
