const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [videoSelect];
const canvas = document.getElementById('canvasOutput');

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

let streaming = false;
let stream = null;
let vc = null;
let width = 0;
let height=0;


function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const videoSource = videoSelect.value;
  const constraints = {
    audio: false,
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints)
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(s){
    window.stream=s;
    videoElement.srcObject=s;
    videoElement.play();
    return navigator.mediaDevices.enumerateDevices();
  })
  .then(gotDevices)
  .catch(handleError);
  videoElement.addEventListener("canplay", function(ev){
    if (!streaming) {
      width = videoElement.clientWidth;
      height = videoElement.clientHeight / (videoElement.clientWidth/width);
      videoElement.setAttribute("width", width);
      videoElement.setAttribute("height", height);
      streaming = true;
      vc = new cv.VideoCapture(videoElement);
    }
  }, false);
}

videoSelect.onchange = start;

start();
