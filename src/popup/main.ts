import '../styles/global.scss';
import { faFloppyDisk, faPenToSquare, faSquarePlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import App from './App.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faSquarePlus);
library.add(faFloppyDisk);
library.add(faTrashCan);
library.add(faPenToSquare);

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app');
