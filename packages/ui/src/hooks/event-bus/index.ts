import { createContext } from 'react';

import EventBus from 'vsch-core/src/utils/EventBusClient.js';

const EventBusInstance = new EventBus();
window._bus = EventBusInstance;

export default createContext(EventBusInstance);
export { EventBusInstance };
