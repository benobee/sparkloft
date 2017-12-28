import Vue from "vue";
import collectionList from "../components/collectionList";
import categoryFilters from "../components/categoryFilters";
import util from "../util/util";
import Events from "../core/events";

/**
 * Pub Sub Events
 * @type {Events}
 */

const events = new Events();

/**
 * All obects, components, event listeners localized to the portfolio list view
 * @type {Object}
 * @memberof App
 * @name collectionListController
 */

const collectionListController = {
    init (parent, displayOptions) {
        this.config = {
            parent: parent.querySelector("#collection-items-vue"),
            displayOptions
        };

        this.data = {};

        util.getData(this.config.parent.dataset.collectionUrl, (response) => {
            if (response) {
                this.initializeVueComponents(response.data);
            }
        });
    },
    initializeVueComponents (data) {
        const filterComponents = categoryFilters(data, events);

        Vue.component("collection-items", collectionList(data, events, this.config.displayOptions));
        Vue.component("category-filters", filterComponents.list);

        const filterList = new Vue({
            el: "#collection-filters-vue"
        });

        const navButton = new Vue(filterComponents.navButton);

        const items = new Vue({
            el: "#collection-items-vue"
        });

        return {
            navButton,
            filterList,
            items
        };
    }
};

export default collectionListController;