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
const FontStore = {
    read() {
        return localStorage.getItem('current-font') ?? 'none'
    },

    write(value) {
        localStorage.setItem('current-font', value)
    }
};

/// UI managers
/**
 * @param {ObservableState} fontStore
 * @param {HTMLUListElement} base
 */
function manageFontSelectionUI(fontStore) {
    const base = document.querySelector('ul.font-list');

    let previous = fontStore.value;
    const entries = base.querySelectorAll("li.list-item");

    function updateFontUI(value) {
        for (const entry of entries) {
            const select = entry.getAttribute('data-select');

            if (!select) continue;

            if (select == value) {
                entry.classList.add('active');
            } else {
                entry.classList.remove('active');
            }
        }

        document.body.classList.remove(`font-${previous}`);
        document.body.classList.add(`font-${value}`);

        previous = value;
    }

    function setupEventListeners() {
        /**
         * @param {MouseEvent} event
         */
        function onClick(event) {
            const selection = event.currentTarget.getAttribute('data-select');

            fontStore.value = selection;
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
    fontStore.listen(updateFontUI);
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
    const currentFont = observableState(FontStore);

    manageFontSelectionUI(currentFont);
    managePopover();

    currentFont.load();
}

initialize();
