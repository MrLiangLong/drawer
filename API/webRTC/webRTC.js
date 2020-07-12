/*
WebRTC 对等连接: 点对点

三种API：
从设备中获取音频和视频(mediastream)
建立了一个对等连接(RTCPeerConnection)
传递任意数据(RTCDataChannel)
*
*/

const { off } = require("process");


/**@localStream
{
    active: true,
    id: "OcH8gsVpUjrOCxwiKjUf258hkbdIB0IicocC",
    onactive: null,
    onaddtrack: null,
    oninactive: null,
    onremovetrack:null
}
*/
//第一步：请求视频/音频许可并开始一个localstream本地流
function getLocalStream(){
    return navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
    })
}

class Local{

}

function remote(){
    const pc = new Window.RTCPeerConnection();
    let dc = pc.createDataChannel('robotchannel',{reliable:false});
    dc.onopen = function(){

    }
    dc.onmessage = function(event){

    }
    dc.onerror = (e)=>{console.log(e)}

    async function createOffer(){
        let offer = await pc.createOffer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: true
        })

        await pc.setLocalDescription(offer);
        return pc.localDescription;
    }

    createOffer().then(offer=>{
        const {type,sdp} = offer;
    })

    async function setRemote(answer){
        await pc.setRemoteDescription(answer);
    }

    pc.oninecandidate = (e)=>{
        const {candidate} = e;
        //告知其他人
    }

    const candidates = [];
    async function addIceCandidate(candidate){
        if(!candidate || !candidate.type) return;
        candidates.push(candidate);
        if(pc.remoteDescrition && pc.remoteDescription.type){
            for(let i=0;i<candidates.length;i++){
                await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
            }
            candidates = [];
        }
    }

    pc.onaddstream = e=>{
        
    }

}