let interval = null;

const TICK_INTERVAL = 30;

self.onmessage = (e) => {
    //메인 스레드에서 메세지 수신
    if (e.data === "start") {
        interval = setInterval(() => {
            self.postMessage("tick"); //30ms마다 메인스레드에 tick 전송
        }, TICK_INTERVAL);
    } else if (e.data === "stop") {
        //stop 받으면 정지
        clearInterval(interval);
    }
};