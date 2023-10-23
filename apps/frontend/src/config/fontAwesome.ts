/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import {
    faVideo,
    faVideoSlash,
    faMicrophone,
    faMicrophoneSlash,
    faEllipsisVertical,
    faXmark,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";

import {
    faHand
} from "@fortawesome/free-regular-svg-icons";

/* add icons to the library */
library.add(
    faVideo,
    faVideoSlash,
    faMicrophone,
    faMicrophoneSlash,
    faEllipsisVertical,
    faXmark,
    faPhone,
    faHand,
);


export default FontAwesomeIcon;
