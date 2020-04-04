
    var localVideo;
    var remoteVideo;
    var localStream;
    var remoteVideo;
    var startbtn;
    var callbtn;
    var hangbtn;
    var peerConnection;
    var backto
    var UIN
    var peerConnectionConfig = {
        'iceServers': [
          {'urls': 'stun:stun.stunprotocol.org:3478'},
          {'urls': 'stun:stun.l.google.com:19302'},
        ]
      };

    var socket=io()
    function pageReady() {
        localVideo = document.getElementById('localVideo');
        remoteVideo = document.getElementById('remoteVideo');
        startbtn=document.getElementById('startbtn');
        callbtn=document.getElementById('callbtn');
        hangbtn=document.getElementById('hangbtn');
        
        callbtn.disabled=true
        hangbtn.disabled=true

        socket.on('forward',(message)=>{
            console.log(message)
            if(!peerConnection)
              backto=message.from
            if(!message.disconnect)
            {
              if(message.to==UIN)
                gotMessageFromServer(message) 
            }
            else{
                alert('The other user has ended the call')
                window.location.reload()
                 
            }
        })
        
    }

    socket.on('uin',(data)=>{
       console.log("My UIN is "+data)
       var uin=document.getElementById('uin')
       uin.innerText='Unique Identifation Number: '+data;
       UIN=data
    })

    function myvideo(){

        var constraints = {
            video: true,
            audio: true,
        };
    
        if(navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints) .then(getUserMediaSuccess) .catch(getUserMediaError);
        } else {
            alert('Your browser does not support getUserMedia API');
        }

    }

    function getUserMediaSuccess(stream) {
        localStream = stream;
        console.log(stream)
        localVideo.srcObject = stream;
        startbtn.disabled=true
        callbtn.disabled=false
    }
    
    function getUserMediaError(error) {
        console.log(error);
    }
    
    function createAnswerError(error) {
        console.log(error);
    }

    function start(isCaller) {
        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.onicecandidate = gotIceCandidate;
        peerConnection.onaddstream = gotRemoteStream;
        if(localStream)
        peerConnection.addStream(localStream);
    
        if(isCaller) {
            peerConnection.createOffer().then(gotDescription).catch (createOfferError);
        }
       
    }
    
    function gotDescription(description) {
        console.log('got description');
        peerConnection.setLocalDescription(description, function () {
            //serverConnection.send(JSON.stringify({'sdp': description}));
            socket.emit('message',{'sdp': description,'to':document.getElementById('to').value|backto,'from':UIN})
        }, function() {console.log('set description error')});
    }
    
    function gotIceCandidate(event) {
        if(event.candidate != null) {
            //serverConnection.send(JSON.stringify({'ice': event.candidate}));
            socket.emit('message',{'ice': event.candidate,'to':document.getElementById('to').value|backto,'from':UIN})
        }
    }
    
    function gotRemoteStream(event) {
        console.log('got remote stream');
        const mediastream=event.stream;
        console.log(mediastream)
        remoteVideo.srcObject = mediastream;
        callbtn.disabled=true
        hangbtn.disabled=false
    }
    
    function createOfferError(error) {
        console.log(error);
    }

    function gotMessageFromServer(message) {
        console.log('message!!')
        if(!peerConnection) 
          start(false);
        
        var signal=message
        if(signal.sdp) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then( function() {
                if(signal.sdp.type == 'offer') {
                    peerConnection.createAnswer().then(gotDescription).catch( createAnswerError);
                }
            });
        } else if(signal.ice) {
            console.log('ice candidate')
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
        }
    }

    function errorHandler(error){
        console.log(error)
    }

    function hangcall(){
        peerConnection=null;
        socket.emit('message',{
           disconnect:true,
           to:document.getElementById('to').value|backto,
           from:UIN
        })
        
    }
    window.onload=function(){
        pageReady()
     }