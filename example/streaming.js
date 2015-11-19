'use strict';

let anomalyDetection = new (require('../'))({
	returnType: 1
});

let log = (msg) => process.stdout.write(msg);

let i = 0;

let _nextIteration = () => {
    let value = Math.round(Math.random () * 4000);

    let anomaly = anomalyDetection.pushMeta(value);

    let mean   = anomaly.mean;
    let stddev = anomaly.stddev;
    let trend  = anomaly.trend;

    log(`\x1B[2K\r[${1 + i}] mean: ${mean} stddev: ${stddev} trend: ${trend} value: ${value} anomaly: ${anomaly.anomaly}`);

    ++i;

    process.nextTick(_nextIteration);
}

_nextIteration();