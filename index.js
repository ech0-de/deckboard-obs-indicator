const { Extension, INPUT_METHOD, PLATFORMS, log } = require('deckboard-kit');
const { BrowserWindow } = require('electron');
const fs = require('fs');

class OBSIndicatorExtension extends Extension {
	constructor() {
            super();
            this.name = 'OBS Indicator';
            this.platforms = [PLATFORMS.WINDOWS];
            this.configs = {};
            this.initExtension();
	}

	initExtension() {
            this.inputs = [];
            // BrowserWindow.fromId(1).webContents.openDevTools();
            BrowserWindow.fromId(1).webContents.executeJavaScript(`
                if (!obsIndicatorLoaded) {
                    var obsIndicatorLoaded = true; 

                    ${fs.readFileSync(require.resolve('obs-websocket-js/dist/obs-websocket.min.js'), 'utf-8')}

                    (() => {
                        const ipc = process.atomBinding('ipc');
                        const changeBG = (color) => {
                            ipc.send('ipc-message', ['execute-action', {
                                target: 'board',
                                action: 'edit',
                                data: {
                                    id: 1,
                                    name: 'OBS',
                                    background: color,
                                    image: '',
                                    layout: 6
                                }
                            }]);
                        };

                        const obs = new OBSWebSocket();
                        obs.connect({ address: 'localhost:4444' });

                        obs.on('ConnectionOpened', x => console.log('opened', x));
                        obs.on('error', x => console.log('socket error', x));

                        obs.on('RecordingStarted', () => changeBG('#660000'));
                        obs.on('RecordingResumed', () => changeBG('#660000'));
                        obs.on('RecordingStopped', () => changeBG('#000000'));
                        obs.on('RecordingPaused', () => changeBG('#7f6000'));

                        obs.on('ConnectionClosed', () => setTimeout(() => obs.connect({ address: 'localhost:4444' }), 5000));
                    })();
                }
            `);
	}

	execute(action, obj) {
	}
}

module.exports = new OBSIndicatorExtension();
