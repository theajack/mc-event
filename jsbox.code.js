/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-22 09:28:56
 * @Description: Coding something
 */
window.jsboxCode = {
    lib: 'https://cdn.jsdelivr.net/npm/mc-event',
    lang: 'javascript',
    code: /* javascript */`MCEvent.on('hello', (v) => {
    console.log('Say ' + v);
});
MCEvent.emit('hello', 'Hi!');`
};