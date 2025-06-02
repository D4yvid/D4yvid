/**
 * @typedef ObservableState
 * @type {{
 *    value: any;
 *    listen(callback: any): void;
 *    unlisten(callback: any): void;
 *    load(): void;
 * }}
 */

/// Utilities

/**
 * @return {ObservableState}
 */
function observableState({ read, write }) {
    let listeners = [];
    let cachedValue = read();

    const ctx = Object.freeze({
        get value() {
            return cachedValue;
        },

        set value(newValue) {
            cachedValue = newValue;

            write(newValue);

            listeners.forEach(listener => listener(newValue));
        },

        listen(callback) {
            listeners.push(callback)
        },

        unlisten(callback) {
            listeners = listeners.filter(cb => cb != callback)
        },

        load() {
            ctx.value = read();
        }
    });

    return ctx;
}

/// Stores
const BackgroundStore = {
    read() {
        return localStorage.getItem('bg-theme') ?? 'none'
    },

    write(value) {
        localStorage.setItem('bg-theme', value)
    }
};

/// UI managers
/**
 * @param {ObservableState} backgroundStore
 * @param {HTMLUListElement} base
 */
function manageBackgroundSelectionUI(backgroundStore) {
    const base = document.querySelector('ul.background-list');

    let previous = backgroundStore.value;
    const entries = base.querySelectorAll("li.list-item");

    function updateBackgroundUI(value) {
        for (const entry of entries) {
            const select = entry.getAttribute('data-select');

            if (!select) continue;

            if (select == value) {
                entry.classList.add('active');
            } else {
                entry.classList.remove('active');
            }
        }

        document.body.classList.remove(`bg-${previous}`);
        document.body.classList.add(`bg-${value}`);

        previous = value;
    }

    function setupEventListeners() {
        /**
         * @param {MouseEvent} event
         */
        function onClick(event) {
            const selection = event.currentTarget.getAttribute('data-select');

            backgroundStore.value = selection;
        }

        for (const entry of entries) {
            // Remove previous listeners if they do exist
            entry.removeEventListener('click', onClick);

            entry.addEventListener('click', onClick);
        }
    }

    // Setup click listeners
    setupEventListeners();

    // Listen for store changes
    backgroundStore.listen(updateBackgroundUI);
}

function managePopover() {
    /** @type {HTMLDivElement} */
    const popover = document.querySelector("div#reading-view-settings");

    popover.addEventListener('click', event => {
        if (event.target == popover) {
            popover.hidePopover();
        }
    });
}

/// Initialization
function initialize() {
    const currentBackground = observableState(BackgroundStore);

    manageBackgroundSelectionUI(currentBackground);
    managePopover();

    currentBackground.load();
}

initialize();
