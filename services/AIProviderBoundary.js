class AIProviderBoundary {
constructor(){ this.providers=new Map(); this.activeProvider=null; }
registerProvider(name,provider){
if(typeof name!=="string"||!name.trim()) throw new Error("Provider name is required.");
if(!provider||typeof provider.generateResponse!=="function") throw new Error("Provider must implement generateResponse().");
this.providers.set(name,provider);
return {success:true,provider:name};
}
setProvider(name){
if(!this.providers.has(name)) return {success:false,code:"PROVIDER_NOT_FOUND",provider:name};
this.activeProvider=name;
return {success:true,provider:name};
}
getProvider(){ return this.activeProvider; }
hasProvider(name){ return this.providers.has(name); }
async generateResponse(request={}){
if(!request||typeof request.message!=="string"||!request.message.trim()) return {success:false,response:null,provider:this.activeProvider,model:null,metadata:{},error:{code:"INVALID_REQUEST",message:"A non-empty message is required."}};
if(!this.activeProvider) return {success:false,response:null,provider:null,model:null,metadata:{},error:{code:"PROVIDER_UNAVAILABLE",message:"No AI provider is configured."}};
const provider=this.providers.get(this.activeProvider);
if(!provider) return {success:false,response:null,provider:this.activeProvider,model:null,metadata:{},error:{code:"PROVIDER_UNAVAILABLE",message:"Active AI provider is unavailable."}};
try{
const result=await provider.generateResponse(request);
if(result&&result.success===false) return {success:false,response:null,provider:result.provider||this.activeProvider,model:result.model||null,metadata:result.metadata||{},error:result.error||{code:"PROVIDER_ERROR",message:"AI provider failed."}};
if(!result||typeof result.response!=="string"||!result.response.trim()) return {success:false,response:null,provider:this.activeProvider,model:result?.model||null,metadata:result?.metadata||{},error:{code:"INVALID_PROVIDER_RESPONSE",message:"Provider returned an invalid response."}};
return {success:true,response:result.response,provider:result.provider||this.activeProvider,model:result.model||null,metadata:result.metadata||{}};
}catch(error){
return {success:false,response:null,provider:this.activeProvider,model:null,metadata:{},error:{code:"PROVIDER_ERROR",message:error.message||"AI provider failed."}};
}
}

async streamResponse(request={},onDelta){
const fail=(code,message,provider=this.activeProvider,model=null)=>({success:false,response:null,provider,model,metadata:{},error:{code,message}});
if(!request||typeof request.message!=="string"||!request.message.trim()) return fail("INVALID_REQUEST","A non-empty message is required.");
if(typeof onDelta!=="function") return fail("INVALID_STREAM_CALLBACK","A streaming callback is required.");
if(!this.activeProvider) return fail("PROVIDER_UNAVAILABLE","No AI provider is configured.",null);
const provider=this.providers.get(this.activeProvider);
if(!provider) return fail("PROVIDER_UNAVAILABLE","Active AI provider is unavailable.");
if(typeof provider.streamResponse!=="function") return fail("STREAMING_UNSUPPORTED","The active provider does not support streaming.");
try{
const result=await provider.streamResponse(request,onDelta);
if(!result||result.success===false) return fail(result?.error?.code||"PROVIDER_ERROR",result?.error?.message||"AI streaming failed.",result?.provider||this.activeProvider,result?.model||null);
if(typeof result.response!=="string"||!result.response.trim()) return fail("INVALID_PROVIDER_RESPONSE","Provider returned an invalid streaming response.",this.activeProvider,result.model||null);
return {success:true,response:result.response,provider:result.provider||this.activeProvider,model:result.model||null,metadata:result.metadata||{}};
}catch(error){
return fail(error?.code||"PROVIDER_ERROR",error?.message||"AI streaming failed.",this.activeProvider);
}
}

}

class DevelopmentProvider {
constructor(){ this.name="development"; this.model="ChatTBM Development Provider"; }
async generateResponse(request){
return {provider:this.name,model:this.model,response:`[ChatTBM Development Provider] Received: "${request.message}"`,metadata:{development:true}};
}
}

module.exports={AIProviderBoundary,DevelopmentProvider};
