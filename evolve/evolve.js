const loopN = 80;   // Store 80 samples of jitter history (10-20 seconds)
var loopInterval;   // Target fastLoop interval with millisecond precision
var loopHist;       // Sliding window of recent timer skew history
var loopIdx = 0;    // Next index in loopHist[]
var loopSkew;       // Sum of all entries in loopHist[]
var loopTargTs;     // Target time for next timer to fire
var timerId;        // For clearing the timer

self.addEventListener('message', function(e){
    const data = e.data;
    switch (data.loop) {
        case 'start':
            loopInterval = data.period;
            loopHist = new Array(loopN).fill(0);
            loopSkew = 0;
            loopTargTs = performance.now() + loopInterval;
            timerId = setTimeout(lowDriftTimer, loopInterval);
            break;
        case 'clear':
            clearTimeout(timerId);
            break;
    };
  }, false);

function lowDriftTimer(){
    const ts = performance.now();
    const jitter = ts - loopTargTs;
    let periods = 1;

    if (jitter > loopInterval){
        // High error mode: run multiple fastLoop calls at once
        periods += Math.floor(jitter / loopInterval);

        // Slowly discard skew history in case it's related to the cause of high skew
        loopSkew -= loopHist[loopIdx];
        loopHist[loopIdx] = 0;

        // Create new baseline timestamp due to high drift
        loopTargTs = ts + loopInterval;
    }
    else {
        // Accumulate skew history normally
        loopSkew += jitter - loopHist[loopIdx];
        loopHist[loopIdx] = jitter;

        // Use existing baseline timestamp
        loopTargTs += loopInterval;
    }

    // Cancel out recent skew to center jitter near zero
    const timeout = (loopTargTs - ts) - (loopSkew / loopN);
    timerId = setTimeout(lowDriftTimer, timeout);
    self.postMessage({ loop: 'main', periods: periods });

    if (++loopIdx === loopN){ loopIdx = 0; }
}
