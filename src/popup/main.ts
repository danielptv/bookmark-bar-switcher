import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/global.scss';
import { Container, Draggable } from 'vue-dndrop';
import {
    faArrowLeft,
    faFloppyDisk,
    faGear,
    faPenToSquare,
    faSquarePlus,
    faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import App from './App.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faSquarePlus);
library.add(faFloppyDisk);
library.add(faTrashCan);
library.add(faPenToSquare);
library.add(faGear);
library.add(faArrowLeft);

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
createApp(App)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .component('Container', Container)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .component('Draggable', Draggable)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app');
