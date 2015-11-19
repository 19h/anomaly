'use strict';

class AnomalyDetection {
    constructor (opts) {
        opts = opts || {};

        /*
            - Confidence Interval -

                1σ: 68.27%
                2σ: 95.45%
                3σ: 99.73%   <-- default
              3.5σ: 99.9534%
                4σ: 99.9936%
                ... ...
            μ ± xσ: erf(x/√2)
        */
        this.confidenceInterval = opts.confidenceInterval || 3;

        /*
            - Return Type -

            1: true / false <- default
            2: anomaly ratio [x - μ] / (conf_interval * σ)
        */
        this.returnType = opts.returnType || 1;

        /*
            - Trending Factor -

            t[0] = x[1], factor: 0~1
            t[n] = t[n-1] * (1 - factor) + factor * x[n]
        */
        this.trendingFactor = 0.1;

        this.m_n = 0;

        this.m_oldM = 0.0;
        this.m_newM = 0.0;
        this.m_oldS = 0.0;
        this.m_newS = 0.0;

        this.t_old = null;
    }

    // will reset on next push
    clear () {
        this.m_n = 0;
    }

    push (value) {
        ++this.m_n;

        let mean = this.mean();
        let standardDeviation = this.standardDeviation();

        // initialize
        if (this.m_n === 1) {
            this.m_oldM = value;
            this.m_newM = value;

            this.m_oldS = 0.0;
        } else {
            this.m_newM = this.m_oldM + (value - this.m_oldM) / this.m_n;
            this.m_newS = this.m_oldS + (value - this.m_oldM) * (value - this.m_newM);

            // set up for next iteration
            this.m_oldM = this.m_newM;
            this.m_oldS = this.m_newS;
        }

        // update trend
        this.trend(value);

        let cisd = this.confidenceInterval * standardDeviation;
        let preamble = Math.abs(value - mean);

        if (this.returnType === 1) {
            return preamble > cisd;
        }

        return preamble / cisd;
    }

    pushMeta (value) {
        let anomaly = this.push(value);

        let mean = this.mean();
        let stddev = this.standardDeviation();

        let trend = this.t_old;

        return {
            anomaly, mean, stddev, trend
        };
    }

    mean () {
        let mean = 0.0;

        if (this.m_n > 0) {
            mean = this.m_newM;
        }

        return mean;
    }

    variance () {
        let variance = 0.0;

        if (this.m_n > 1) {
            return this.m_newS / (this.m_n - 1);
        }

        return variance;
    }

    standardDeviation () {
        return Math.sqrt(this.variance());
    }

    /*
        Weighted moving average
    */

    trend (value) {
        if (this.t_old === null) {
            this.t_old = value;
        }

        let last   = this.t_old;
        let factor = this.trendingFactor;

        this.t_old = last * (1 - factor) + factor * value;

        return this.t_old;
    }
}

module.exports = AnomalyDetection;