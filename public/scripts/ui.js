const initUI = () => {
  const nameMessage = document.getElementById('name-message');
  const createButton = document.getElementById('create-btn');
  const getInvitedButton = document.getElementById('get-invited-btn');
  const conferenceAliasInput = document.getElementById('alias-input');
  const conferenceIdInput = document.getElementById('confid-input');
  const leaveButton = document.getElementById('leave-btn');
  const lblDolbyVoice = document.getElementById('label-dolby-voice');
  const startVideoBtn = document.getElementById('start-video-btn');
  const stopVideoBtn = document.getElementById('stop-video-btn');
  const startAudioBtn = document.getElementById('start-audio-btn');
  const stopAudioBtn = document.getElementById('stop-audio-btn');
  const startScreenShareBtn = document.getElementById('start-screenshare-btn');
  const stopScreenShareBtn = document.getElementById('stop-screenshare-btn');
  const startRecordingBtn = document.getElementById('start-recording-btn');
  const stopRecordingBtn = document.getElementById('stop-recording-btn');

  // Update the login message with the name of the user
  nameMessage.innerHTML = `You are logged in as ${randomName}`;
  createButton.disabled = false;
  getInvitedButton.disabled = false;

  const joinConference = (conferenceId, conferenceAccessToken) => {
    VoxeetSDK.conference.fetch(conferenceId)
      .then(conference => {
        // See: https://docs.dolby.io/communications-apis/docs/js-client-sdk-model-joinoptions
        const joinOptions = {
          conferenceAccessToken: conferenceAccessToken,
          constraints: {
            audio: true,
            video: false
          },
          simulcast: false
        };

        // 2. Join the conference
        VoxeetSDK.conference.join(conference, joinOptions)
          .then((conf) => {
            lblDolbyVoice.innerHTML = `Dolby Voice is ${conf.params.dolbyVoice ? 'On' : 'Off'}.`;
            conferenceIdInput.value = conferenceId;

            conferenceAliasInput.disabled = true;
            createButton.disabled = true;
            getInvitedButton.disabled = true;
            leaveButton.disabled = false;
            startVideoBtn.disabled = false;
            startAudioBtn.disabled = true;
            stopAudioBtn.disabled = false;
            startScreenShareBtn.disabled = false;
            startRecordingBtn.disabled = false;
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  };

  createButton.onclick = () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        alias: conferenceAliasInput.value,
        ownerExternalId: randomName
      })
    };

    // Request our backend to create a conference
    fetch('conference', options)
      .then(d => d.json())
      .then(conference => joinConference(conference.conferenceId, conference.ownerToken))
      .catch((e) => console.log(e));
  };

  getInvitedButton.onclick = () => {
    VoxeetSDK.conference.fetch(conferenceIdInput.value)
      .then(conference => {
        console.log(conference);
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            conferenceId: conference.id,
            externalId: randomName
          })
        };
    
        // Request our backend for an invitation
        fetch('get-invited', options)
          .then(d => d.json())
          .then(invite => joinConference(conference.id, invite.accessToken))
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  };

  leaveButton.onclick = () => {
    // Leave the conference
    VoxeetSDK.conference.leave()
      .then(() => {
        lblDolbyVoice.innerHTML = '';

        conferenceAliasInput.disabled = false;
        createButton.disabled = false;
        getInvitedButton.disabled = false;
        leaveButton.disabled = true;
        startVideoBtn.disabled = true;
        stopVideoBtn.disabled = true;
        startAudioBtn.disabled = true;
        stopAudioBtn.disabled = true;
        startScreenShareBtn.disabled = true;
        stopScreenShareBtn.disabled = true;
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = true;
      })
      .catch((e) => console.log(e));
  };

  startVideoBtn.onclick = () => {
    // Start sharing the video with the other participants
    VoxeetSDK.conference.startVideo(VoxeetSDK.session.participant)
      .then(() => {
        startVideoBtn.disabled = true;
        stopVideoBtn.disabled = false;
      })
      .catch((e) => console.log(e));
  };

  stopVideoBtn.onclick = () => {
    // Stop sharing the video with the other participants
    VoxeetSDK.conference.stopVideo(VoxeetSDK.session.participant)
      .then(() => {
        stopVideoBtn.disabled = true;
        startVideoBtn.disabled = false;
      })
      .catch((e) => console.log(e));
  };

  startAudioBtn.onclick = () => {
    // Start sharing the Audio with the other participants
    VoxeetSDK.conference.startAudio(VoxeetSDK.session.participant)
      .then(() => {
        startAudioBtn.disabled = true;
        stopAudioBtn.disabled = false;
      })
      .catch((e) => console.log(e));
  };

  stopAudioBtn.onclick = () => {
    // Stop sharing the Audio with the other participants
    VoxeetSDK.conference.stopAudio(VoxeetSDK.session.participant)
      .then(() => {
        stopAudioBtn.disabled = true;
        startAudioBtn.disabled = false;
      })
      .catch((e) => console.log(e));
  };

  startScreenShareBtn.onclick = () => {
    // Start the Screen Sharing with the other participants
    VoxeetSDK.conference.startScreenShare()
      .then(() => {
        startScreenShareBtn.disabled = true;
        stopScreenShareBtn.disabled = false;
      })
      .catch((e) => console.log(e));
  };

  stopScreenShareBtn.onclick = () => {
    // Stop the Screen Sharing
    VoxeetSDK.conference.stopScreenShare()
      .catch((e) => console.log(e));
  };

  startRecordingBtn.onclick = () => {
    let recordStatus = document.getElementById('record-status');
    
    // Start recording the conference
    VoxeetSDK.recording.start()
      .then(() => {
        recordStatus.innerText = 'Recording...';
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
      })
      .catch((e) => console.log(e));
  };

  stopRecordingBtn.onclick = () => {
    let recordStatus = document.getElementById('record-status');

    // Stop recording the conference
    VoxeetSDK.recording.stop()
      .then(() => {
        recordStatus.innerText = '';
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
      })
      .catch((e) => console.log(e));
  };

};

// Add a video stream to the web page
const addVideoNode = (participant, stream) => {
  let videoNode = document.getElementById('video-' + participant.id);

  if (!videoNode) {
    videoNode = document.createElement('video');

    videoNode.setAttribute('id', 'video-' + participant.id);
    videoNode.setAttribute('height', 240);
    videoNode.setAttribute('width', 320);
    videoNode.setAttribute("playsinline", true);
    videoNode.muted = true;
    videoNode.setAttribute("autoplay", 'autoplay');
    videoNode.style = 'background: gray;';

    const videoContainer = document.getElementById('video-container');
    videoContainer.appendChild(videoNode);
  }

  navigator.attachMediaStream(videoNode, stream);
};

// Remove the video stream from the web page
const removeVideoNode = (participant) => {
  let videoNode = document.getElementById('video-' + participant.id);

  if (videoNode) {
    videoNode.parentNode.removeChild(videoNode);
  }
};

// Add a new participant to the list
const addParticipantNode = (participant) => {
  // If the participant is the current session user, don't add himself to the list
  if (participant.id === VoxeetSDK.session.participant.id) return;

  let participantNode = document.createElement('li');
  participantNode.setAttribute('id', 'participant-' + participant.id);
  participantNode.innerText = `${participant.info.name}`;

  const participantsList = document.getElementById('participants-list');
  participantsList.appendChild(participantNode);
};

// Remove a participant from the list
const removeParticipantNode = (participant) => {
  let participantNode = document.getElementById('participant-' + participant.id);

  if (participantNode) {
    participantNode.parentNode.removeChild(participantNode);
  }
};

// Add a screen share stream to the web page
const addScreenShareNode = (stream) => {
  let screenShareNode = document.getElementById('screenshare');

  if (screenShareNode) {
    return alert('There is already a participant sharing a screen!');
  }

  screenShareNode = document.createElement('video');
  screenShareNode.setAttribute('id', 'screenshare');
  screenShareNode.autoplay = 'autoplay';
  navigator.attachMediaStream(screenShareNode, stream);

  const screenShareContainer = document.getElementById('screenshare-container');
  screenShareContainer.appendChild(screenShareNode);
}

// Remove the screen share stream from the web page
const removeScreenShareNode = () => {
  let screenShareNode = document.getElementById('screenshare');

  if (screenShareNode) {
    screenShareNode.parentNode.removeChild(screenShareNode);
  }
  
  const startScreenShareBtn = document.getElementById('start-screenshare-btn');
  startScreenShareBtn.disabled = false;
  
  const stopScreenShareBtn = document.getElementById('stop-screenshare-btn');
  stopScreenShareBtn.disabled = true;
}
