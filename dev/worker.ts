/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-12 14:59:07
 * @Description: Coding something
 */
import {MCEveit} from '../src';


async function workerMain () {
    console.log('workerMain init');
    const events = await MCEveit.copy();

    console.log('workerMain events.ready');

    events.on('test', (data) => {
        console.log('worker receive: ', data);
    });
    events.once('test', (data) => {
        console.log('worker receive once: ', data);
    });
    events.head('test', (data) => {
        console.log('worker receive head:  ', data);
    });
    events.headOnce('test', (data) => {
        console.log('worker receive headOnce: ', data);
    });
    events.emit('test', 'worker data');
}

workerMain();