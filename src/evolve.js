var intervals = {};
self.addEventListener('message', function(e){
    var data = e.data;
    switch (data.loop) {
        case 'short':
            intervals['main_loop'] = setInterval(function(){
                self.postMessage('fast');
            }, data.period);
            break;
        case 'mid':
            intervals['mid_loop'] = setInterval(function(){
                self.postMessage('mid');
            }, data.period);
            break;
        case 'long':
            intervals['long_loop'] = setInterval(function(){
                self.postMessage('long');
            }, data.period);
            break;
        case 'clear':
            clearInterval(intervals['main_loop']);
            clearInterval(intervals['mid_loop']);
            clearInterval(intervals['long_loop']);
            break;
    };
  }, false);
