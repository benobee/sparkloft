import filtersHTML from "./categoryFilters.html";

/**
 * A vue component. The filter list rendered for a
 * particular collection. Takes data and events from the
 * master controller config.
 *
 * @param  {Object} data   collection data
 * @param  {Oject} events pub sub events
 * @memberof collectionListController
 * @returns {Object}        for use as a Vue component
 */

const categoryFilters = (data, events) => {
    const navButton = {
        el: "#filter-ui",
        template: `
            <div id="filter-ui">
                <span class="filter-ui__icon" v-on:click="handleClick">
                    <img src="https://static1.squarespace.com/static/56c3bbbde32140bf1af5de49/t/5a3853f2e4966b79a0f9aab1/1513640946108/filter.png"/>
                </span>
                <span class="filter-ui__label">{{ label }}</span>
                <span v-on:click="handleClick" v-if="isActive" class="filter-ui__category">{{ currentFilter }}</span>
                <span v-on:click="handleClick" v-else class="filter-ui__category">All</span>
            </div>
        `,
        data () {
            return {
                label: "Filter By ",
                currentFilter: "All",
                isActive: false
            };
        },
        methods: {
            handleClick (e) {
                events.emit("filter-ui-clicked", (e));
            }
        },
        mounted () {
            events.on("filter-set", (e) => {
                this.currentFilter = e.filterName;
                if (e.filterName === "All") {
                    this.isActive = false;
                } else {
                    this.isActive = true;
                }
            });
        }
    };

    const list = {
        template: filtersHTML,
        data () {
            return {
                transitionActive: false,
                isActive: false,
                categories: data.collection.categories
            };
        },
        methods: {

            /**
             * Waits for the component to be rendered, then
             * allows interaction with the DOM.
             *
             * @private
             */

            setFilter (filter) {
                events.emit("filter-set", { filterName: filter });
                this.closeMenu();
            },
            resetFilters () {
                events.emit("filter-set", { filterName: "All" });
            },
            openMenu () {
                document.body.classList.add("disable-scroll");
                this.isActive = true;
            },
            closeMenu () {
                document.body.classList.remove("disable-scroll");
                this.transitionActive = true;
                setTimeout(() => {
                    this.isActive = false;
                    this.transitionActive = false;
                }, 500);
            }
        },
        mounted () {
            events.on("filter-ui-clicked", () => {
                this.openMenu();
            });
        }
    };

    return {
        navButton,
        list
    };
};

export default categoryFilters;