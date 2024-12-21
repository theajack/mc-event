/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-22 09:28:56
 * @Description: Coding something
 */
window.jsboxCode = {
    lib: 'https://cdn.jsdelivr.net/npm/mc-event',
    lang: 'javascript',
    code: /* javascript */`const events = MCEvent.Events;
events.on('hello', (v) => {
    console.log('Say ' + v);
});
events.emit('hello', 'Hi!');`
};