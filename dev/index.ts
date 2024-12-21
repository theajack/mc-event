/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-05 15:30:15
 * @Description: Coding something
 */
import {MCEvent} from '../src';
// import MCEvent from '../npm';

import WorkerEntry from './worker?worker&inline';

async function main () {
    console.log('main init');

    const events = MCEvent.new();

    const worker = new WorkerEntry();
    events.into(worker);
    console.log('main events.ready');

    const clear = events.on('test', (data) => {
        console.log('main receive: ', data);
    });
    events.once('test', (data) => {
        console.log('main receive once: ', data);
    });
    events.head('test', (data) => {
        console.log('main receive head:  ', data);
    });
    events.headOnce('test', (data) => {
        console.log('main receive headOnce: ', data);
    });
    events.emit('test', 'main data');

    window.ee = events;
    window.cl = clear;

}

main();

